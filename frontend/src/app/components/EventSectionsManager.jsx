"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import AlertModal from "./AlertModal";
import ConfirmModal from "./ConfirmModal";
import MultiImageUpload from "./MultiImageUpload";
import {
  addEventSection,
  updateEventSection,
  deleteEventSection,
} from "../lib/events";

/**
 * Event Sections Manager Component
 * Manages content sections for an event
 */
export default function EventSectionsManager({
  eventId,
  sections = [],
  onUpdate,
  event, // Pass event to check enabled modules
}) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [activeContentTab, setActiveContentTab] = useState("overview");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "overview",
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();

  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState({});

  // Alert modal
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Client-side validation
  const validateForm = () => {
    const errors = {};

    if (!formData.title?.trim()) {
      errors.title =
        language === "ms" ? "Tajuk diperlukan" : "Title is required";
    } else if (formData.title.length > 255) {
      errors.title =
        language === "ms"
          ? "Tajuk tidak boleh melebihi 255 aksara"
          : "Title cannot exceed 255 characters";
    }

    // Content is required only if there are no images
    if (
      !formData.content?.trim() &&
      (!formData.images || formData.images.length === 0)
    ) {
      errors.content =
        language === "ms"
          ? "Kandungan atau gambar diperlukan"
          : "Content or images required";
    }

    return errors;
  };

  const handleAdd = async () => {
    // Client-side validation
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await addEventSection(eventId, formData);
      setFormData({ title: "", content: "", category: "overview", images: [] });
      setFieldErrors({});
      setAdding(false);
      onUpdate?.();
    } catch (error) {
      // Parse backend validation errors
      if (error.response?.data?.errors) {
        const backendErrors = {};
        const errorData = error.response.data.errors;

        Object.keys(errorData).forEach((key) => {
          backendErrors[key] = errorData[key][0];
        });

        setFieldErrors(backendErrors);
      } else {
        // Show general error in modal
        setAlertModal({
          isOpen: true,
          title: language === "ms" ? "Ralat" : "Error",
          message:
            error.response?.data?.message ||
            error.message ||
            (language === "ms"
              ? "Gagal menambah bahagian"
              : "Failed to add section"),
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (sectionId) => {
    // Client-side validation
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await updateEventSection(eventId, sectionId, formData);
      setFormData({ title: "", content: "", category: "overview", images: [] });
      setFieldErrors({});
      setEditing(null);
      onUpdate?.();
    } catch (error) {
      // Parse backend validation errors
      if (error.response?.data?.errors) {
        const backendErrors = {};
        const errorData = error.response.data.errors;

        Object.keys(errorData).forEach((key) => {
          backendErrors[key] = errorData[key][0];
        });

        setFieldErrors(backendErrors);
      } else {
        setAlertModal({
          isOpen: true,
          title: language === "ms" ? "Ralat" : "Error",
          message:
            error.response?.data?.message ||
            error.message ||
            (language === "ms"
              ? "Gagal mengemaskini bahagian"
              : "Failed to update section"),
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sectionId) => {
    setConfirmModal({
      isOpen: true,
      title: language === "ms" ? "Padam Bahagian?" : "Delete Section?",
      message:
        language === "ms"
          ? "Adakah anda pasti mahu memadam bahagian ini?"
          : "Are you sure you want to delete this section?",
      onConfirm: async () => {
        try {
          await deleteEventSection(eventId, sectionId);
          onUpdate?.();
        } catch (error) {
          setAlertModal({
            isOpen: true,
            title: language === "ms" ? "Ralat" : "Error",
            message:
              error.response?.data?.message ||
              error.message ||
              (language === "ms"
                ? "Gagal memadam bahagian"
                : "Failed to delete section"),
            type: "error",
          });
        }
      },
    });
  };

  const startEdit = (section) => {
    setEditing(section.id);
    setFormData({
      title: section.title,
      content: section.content,
      category: section.category || "overview",
      images: section.images || [],
    });
    setAdding(false);
  };

  const cancelEdit = () => {
    // Store current editing section ID before clearing
    const sectionIdToScrollTo = editing;

    setEditing(null);
    setAdding(false);
    setFormData({ title: "", content: "", category: "overview", images: [] });
    setFieldErrors({});

    // Scroll to the section container after closing edit
    if (sectionIdToScrollTo) {
      setTimeout(() => {
        const sectionElement = document.querySelector(
          `[data-section-id="${sectionIdToScrollTo}"]`
        );
        if (sectionElement) {
          sectionElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 250); // Wait for animation to complete
    }
  };

  // Group sections by category
  const groupedSections = {
    overview: sections
      .filter((s) => s.category === "overview" || !s.category)
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
    participant_details: sections
      .filter((s) => s.category === "participant_details")
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
    volunteer_details: sections
      .filter((s) => s.category === "volunteer_details")
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
    donation_details: sections
      .filter((s) => s.category === "donation_details")
      .sort((a, b) => (a.order || 0) - (b.order || 0)),
  };

  const categoryConfig = {
    overview: {
      label: language === "ms" ? "Overview" : "Overview",
      color: "bg-blue-50 border-blue-200",
      enabled: true,
    },
    participant_details: {
      label: language === "ms" ? "Arahan Peserta" : "Participant Instructions",
      color: "bg-purple-50 border-purple-200",
      enabled: event?.has_participant,
    },
    volunteer_details: {
      label:
        language === "ms" ? "Arahan Sukarelawan" : "Volunteer Instructions",
      color: "bg-green-50 border-green-200",
      enabled: event?.has_volunteer,
    },
    donation_details: {
      label: language === "ms" ? "Arahan Derma" : "Donation Instructions",
      color: "bg-rose-50 border-rose-200",
      enabled: event?.has_donation,
    },
  };

  // Move section up or down
  const moveSection = async (category, sectionId, direction) => {
    const categorySections = groupedSections[category];
    const currentIndex = categorySections.findIndex((s) => s.id === sectionId);

    if (currentIndex === -1) return;
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === categorySections.length - 1)
      return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const reordered = [...categorySections];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // INSTANT UPDATE: Refresh UI immediately (optimistic update)
    onUpdate?.();

    // Update backend in background
    try {
      for (let i = 0; i < reordered.length; i++) {
        const section = reordered[i];
        await updateEventSection(eventId, section.id, {
          title: section.title,
          content: section.content,
          category: section.category || "overview",
          images: section.images || [],
          order: i,
        });
      }
      // Refresh again after backend confirms (in case there were changes)
      onUpdate?.();
    } catch (error) {
      console.error("Failed to update order:", error);
      // Revert UI on error
      onUpdate?.();
      setAlertModal({
        isOpen: true,
        title: language === "ms" ? "Ralat" : "Error",
        message:
          language === "ms"
            ? "Gagal mengemas kini susunan"
            : "Failed to update order",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Event Sections</h3>
        {!adding && !editing && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </button>
        )}
      </div>

      {/* Add/Edit Form - Top (Add New Only) */}
      {adding && !editing && (
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-emerald-300">
          <h4 className="font-medium text-gray-900 mb-3">New Section</h4>
          <div className="space-y-3">
            {/* Title Field */}
            <div>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  // Clear error when typing
                  if (fieldErrors.title) {
                    setFieldErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                placeholder={
                  language === "ms" ? "Tajuk Bahagian" : "Section Title"
                }
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  fieldErrors.title ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.title && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.title}</p>
              )}
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ms" ? "Paparkan Dalam" : "Display In"}
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="overview">
                  {language === "ms" ? "Tab Overview" : "Overview Tab"}
                </option>
                {event?.has_participant && (
                  <option value="participant_details">
                    {language === "ms" ? "Modul Peserta" : "Participant Module"}
                  </option>
                )}
                {event?.has_volunteer && (
                  <option value="volunteer_details">
                    {language === "ms"
                      ? "Modul Sukarelawan"
                      : "Volunteer Module"}
                  </option>
                )}
                {event?.has_donation && (
                  <option value="donation_details">
                    {language === "ms" ? "Modul Derma" : "Donation Module"}
                  </option>
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {language === "ms"
                  ? "Hanya modul yang diaktifkan ditunjukkan"
                  : "Only enabled modules are shown"}
              </p>
            </div>

            {/* Multi-Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Images (Optional)
              </label>
              <MultiImageUpload
                images={formData.images}
                onChange={(newImages) =>
                  setFormData({ ...formData, images: newImages })
                }
                maxImages={5}
              />
            </div>

            {/* Content Field */}
            <div>
              <textarea
                value={formData.content}
                onChange={(e) => {
                  setFormData({ ...formData, content: e.target.value });
                  // Clear error when typing
                  if (fieldErrors.content) {
                    setFieldErrors((prev) => ({ ...prev, content: undefined }));
                  }
                }}
                placeholder={
                  language === "ms" ? "Kandungan Bahagian" : "Section Content"
                }
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  fieldErrors.content ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.content && (
                <p className="text-red-600 text-sm mt-1">
                  {fieldErrors.content}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={cancelEdit}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => (editing ? handleUpdate(editing) : handleAdd())}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : editing ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation for Categories */}
      {!adding && !editing && sections.length > 0 && (
        <div className="border-b border-gray-200 mb-4 -mx-4 sm:mx-0">
          <div className="flex gap-1 overflow-x-auto px-4 sm:px-0 scrollbar-hide snap-x snap-mandatory scroll-smooth">
            {Object.entries(categoryConfig).map(([category, config]) => {
              if (!config.enabled) return null;
              const count = groupedSections[category].length;
              if (count === 0) return null;

              return (
                <button
                  key={category}
                  onClick={() => setActiveContentTab(category)}
                  className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors snap-start ${
                    activeContentTab === category
                      ? "text-emerald-600 border-emerald-600"
                      : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  {config.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sections List - Grouped by Category */}
      <div className="space-y-6">
        {sections.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600">
              {language === "ms"
                ? "Tiada bahagian lagi. Tambah bahagian pertama!"
                : "No sections yet. Add your first section!"}
            </p>
          </div>
        ) : (
          Object.entries(categoryConfig)
            .filter(([category]) => category === activeContentTab)
            .map(([category, config]) => {
              const categorySections = groupedSections[category];

              // Only show if enabled and has sections
              if (!config.enabled || categorySections.length === 0) return null;

              return (
                <div
                  key={category}
                  className={`border-2 rounded-xl p-5 ${config.color}`}
                >
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm ${
                        category === "overview"
                          ? "bg-blue-100 text-blue-700"
                          : category === "participant_details"
                          ? "bg-purple-100 text-purple-700"
                          : category === "volunteer_details"
                          ? "bg-green-100 text-green-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {config.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({categorySections.length})
                    </span>
                  </h4>

                  <div className="space-y-3">
                    {categorySections.map((section, index) => (
                      <motion.div
                        key={section.id}
                        data-section-id={section.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          {/* Number + Up/Down Arrows */}
                          <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            <span className="text-xs font-bold text-gray-500 bg-gray-100 rounded-full h-6 w-6 flex items-center justify-center">
                              {index + 1}
                            </span>
                            <div className="flex flex-col gap-0.5">
                              <button
                                onClick={() =>
                                  moveSection(category, section.id, "up")
                                }
                                disabled={index === 0}
                                className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title={
                                  language === "ms" ? "Alih ke atas" : "Move up"
                                }
                              >
                                <ChevronUp className="h-4 w-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() =>
                                  moveSection(category, section.id, "down")
                                }
                                disabled={index === categorySections.length - 1}
                                className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title={
                                  language === "ms"
                                    ? "Alih ke bawah"
                                    : "Move down"
                                }
                              >
                                <ChevronDown className="h-4 w-4 text-gray-600" />
                              </button>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-1 truncate">
                              {section.title}
                            </h4>

                            {/* Display Images if available */}
                            {section.images && section.images.length > 0 && (
                              <div className="flex gap-2 mb-2 flex-wrap">
                                {section.images.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`Section image ${idx + 1}`}
                                    className="w-16 h-16 object-cover rounded border border-gray-200"
                                  />
                                ))}
                              </div>
                            )}

                            <p className="text-gray-600 text-sm line-clamp-2">
                              {section.content}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => startEdit(section)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Edit2 className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(section.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </div>

                        {/* Inline Edit Form */}
                        <AnimatePresence>
                          {editing === section.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-4 pt-4 border-t-2 border-gray-200 bg-gray-50 rounded-b-lg p-4 overflow-hidden"
                            >
                              <h4 className="font-medium text-gray-900 mb-3">
                                Edit Section
                              </h4>
                              <div className="space-y-3">
                                {/* Title Field */}
                                <div>
                                  <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => {
                                      setFormData({
                                        ...formData,
                                        title: e.target.value,
                                      });
                                      if (fieldErrors.title) {
                                        setFieldErrors((prev) => ({
                                          ...prev,
                                          title: undefined,
                                        }));
                                      }
                                    }}
                                    placeholder={
                                      language === "ms"
                                        ? "Tajuk Bahagian"
                                        : "Section Title"
                                    }
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                                      fieldErrors.title
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    }`}
                                  />
                                  {fieldErrors.title && (
                                    <p className="text-red-600 text-sm mt-1">
                                      {fieldErrors.title}
                                    </p>
                                  )}
                                </div>

                                {/* Category Selector */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {language === "ms"
                                      ? "Paparkan Dalam"
                                      : "Display In"}
                                  </label>
                                  <select
                                    value={formData.category}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        category: e.target.value,
                                      })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                  >
                                    <option value="overview">
                                      {language === "ms"
                                        ? "Tab Overview"
                                        : "Overview Tab"}
                                    </option>
                                    {event?.has_participant && (
                                      <option value="participant_details">
                                        {language === "ms"
                                          ? "Modul Peserta"
                                          : "Participant Module"}
                                      </option>
                                    )}
                                    {event?.has_volunteer && (
                                      <option value="volunteer_details">
                                        {language === "ms"
                                          ? "Modul Sukarelawan"
                                          : "Volunteer Module"}
                                      </option>
                                    )}
                                    {event?.has_donation && (
                                      <option value="donation_details">
                                        {language === "ms"
                                          ? "Modul Derma"
                                          : "Donation Module"}
                                      </option>
                                    )}
                                  </select>
                                </div>

                                {/* Multi-Image Upload */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Section Images (Optional)
                                  </label>
                                  <MultiImageUpload
                                    images={formData.images}
                                    onChange={(newImages) =>
                                      setFormData({
                                        ...formData,
                                        images: newImages,
                                      })
                                    }
                                    maxImages={5}
                                  />
                                </div>

                                {/* Content Field */}
                                <div>
                                  <textarea
                                    value={formData.content}
                                    onChange={(e) => {
                                      setFormData({
                                        ...formData,
                                        content: e.target.value,
                                      });
                                      if (fieldErrors.content) {
                                        setFieldErrors((prev) => ({
                                          ...prev,
                                          content: undefined,
                                        }));
                                      }
                                    }}
                                    placeholder={
                                      language === "ms"
                                        ? "Kandungan Bahagian"
                                        : "Section Content"
                                    }
                                    rows={4}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                                      fieldErrors.content
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    }`}
                                  />
                                  {fieldErrors.content && (
                                    <p className="text-red-600 text-sm mt-1">
                                      {fieldErrors.content}
                                    </p>
                                  )}
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    onClick={cancelEdit}
                                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleUpdate(editing)}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                  >
                                    {loading ? "Saving..." : "Update"}
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        language={language}
        type="danger"
      />
    </div>
  );
}
