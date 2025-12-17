"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Save, X, Image as ImageIcon } from "lucide-react";
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
}) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
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

    if (!formData.content?.trim()) {
      errors.content =
        language === "ms" ? "Kandungan diperlukan" : "Content is required";
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
      setFormData({ title: "", content: "", images: [] });
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
      setFormData({ title: "", content: "", images: [] });
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
      images: section.images || [],
    });
    setAdding(false);
  };

  const cancelEdit = () => {
    setEditing(null);
    setAdding(false);
    setFormData({ title: "", content: "", images: [] });
    setFieldErrors({});
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

      {/* Add/Edit Form */}
      {(adding || editing) && (
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-emerald-300">
          <h4 className="font-medium text-gray-900 mb-3">
            {editing ? "Edit Section" : "New Section"}
          </h4>
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

      {/* Sections List */}
      <div className="space-y-3">
        {sections.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600">
              No sections yet. Add your first section!
            </p>
          </div>
        ) : (
          sections.map((section) => (
            <div
              key={section.id}
              className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
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

                  <p className="text-gray-600 text-sm">{section.content}</p>
                </div>
                <div className="flex gap-2 ml-4">
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
            </div>
          ))
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
