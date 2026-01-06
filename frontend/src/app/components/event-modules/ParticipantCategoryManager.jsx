"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Users,
  DollarSign,
  Calendar,
  Edit2,
  Save,
  X,
  MapPin,
  Check,
} from "lucide-react";
import SavedLocationPicker from "../SavedLocationPicker";
import { FEE_TYPES, TIER_TYPES } from "../../lib/api/participant";
import { NumericInput, FeeInput, DateInput } from "../inputs";
import { useLanguage } from "../../contexts/LanguageContext";
import AlertModal from "../AlertModal";
import ConfirmModal from "../ConfirmModal";

/**
 * Component for managing participant categories and pricing
 */
export default function ParticipantCategoryManager({
  categories = [],
  feeTiers = {},
  onAddCategory,
  onUpdateCategory,
  onRemoveCategory,
  onAddTier,
  onUpdateTier,
  onRemoveTier,
}) {
  const { language } = useLanguage();
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Field-level validation errors
  const [categoryErrors, setCategoryErrors] = useState({});

  // Alert modal
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Refs for auto-scroll
  const categoryFormRef = useRef(null);

  const [categoryForm, setCategoryForm] = useState({
    category_name: "",
    has_custom_datetime: false, // Checkbox to enable custom date/time
    event_date: "",
    event_time: "",
    capacity_type: "unlimited", // Radio: unlimited or limited
    capacity: "", // Only required if capacity_type === "limited"
    has_category_location: false, // Checkbox to enable category-specific location
    location_type: "event_location",
    location_name: "",
    latitude: null,
    longitude: null,
    location_details: "",
    has_fee: false, // Checkbox to enable fee
    fee_type: "fixed", // Always fixed when has_fee is true
    base_fee: "", // Only required if has_fee === true
    description: "",
    has_event_tshirt: false,
    has_finisher_tshirt: false,
    has_bib: true,
  });

  const [showTierForm, setShowTierForm] = useState(null); // categoryId
  const [tierForm, setTierForm] = useState({
    tier_type: "",
    tier_name: "",
    fee_amount: "",
    valid_from: "",
    valid_until: "",
  });

  const resetCategoryForm = () => {
    // Store current editing category ID before clearing
    const categoryIdToScrollTo = editingCategory?.id;

    setCategoryForm({
      category_name: "",
      has_custom_datetime: false,
      event_date: "",
      event_time: "",
      capacity_type: "unlimited",
      capacity: "",
      has_category_location: false,
      location_type: "event_location",
      location_name: "",
      latitude: null,
      longitude: null,
      location_details: "",
      has_fee: false,
      fee_type: "fixed",
      base_fee: "",
      description: "",
      has_event_tshirt: false,
      has_finisher_tshirt: false,
      has_bib: true,
    });
    setEditingCategory(null);
    setShowCategoryForm(false);

    // Scroll to the category container after closing edit
    if (categoryIdToScrollTo) {
      setTimeout(() => {
        const categoryElement = document.querySelector(
          `[data-category-id="${categoryIdToScrollTo}"]`
        );
        if (categoryElement) {
          categoryElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 250); // Wait for animation to complete
    }
  };

  const resetTierForm = () => {
    setTierForm({
      tier_type: "",
      tier_name: "",
      fee_amount: "",
      valid_from: "",
      valid_until: "",
    });
    setShowTierForm(null);
  };

  // Category form validation
  const validateCategoryForm = () => {
    const errors = {};

    if (!categoryForm.category_name?.trim()) {
      errors.category_name =
        language === "ms"
          ? "Nama kategori diperlukan"
          : "Category name is required";
    }

    // Only validate date/time if custom datetime is enabled
    if (categoryForm.has_custom_datetime) {
      if (!categoryForm.event_date) {
        errors.event_date =
          language === "ms"
            ? "Tarikh acara diperlukan"
            : "Event date is required";
      }

      if (!categoryForm.event_time) {
        errors.event_time =
          language === "ms"
            ? "Masa acara diperlukan"
            : "Event time is required";
      }
    }

    // Capacity only required if capacity_type === "limited"
    if (
      categoryForm.capacity_type === "limited" &&
      (!categoryForm.capacity || categoryForm.capacity < 1)
    ) {
      errors.capacity =
        language === "ms"
          ? "Kapasiti mesti sekurang-kurangnya 1"
          : "Capacity must be at least 1";
    }

    // Base fee only required if has_fee === true (minimum RM 1.00 = 100 cents)
    if (
      categoryForm.has_fee &&
      (!categoryForm.base_fee || categoryForm.base_fee < 100)
    ) {
      errors.base_fee =
        language === "ms"
          ? "Yuran mesti sekurang-kurangnya RM 1.00"
          : "Fee must be at least RM 1.00";
    }

    // This validation assumes 'location_name' is the field to check for location presence.
    // If 'location' is a separate field, adjust accordingly.
    if (
      !categoryForm.location_name?.trim() &&
      categoryForm.location_type === "custom"
    ) {
      errors.location_name =
        language === "ms" ? "Lokasi diperlukan" : "Location is required";
    }

    return errors;
  };

  const handleSaveCategory = async () => {
    // Client-side validation
    const errors = validateCategoryForm();
    if (Object.keys(errors).length > 0) {
      setCategoryErrors(errors);
      return;
    }

    try {
      const data = {
        ...categoryForm,
        capacity:
          categoryForm.capacity_type === "limited"
            ? parseInt(categoryForm.capacity)
            : null,
        base_fee: categoryForm.has_fee ? parseInt(categoryForm.base_fee) : null,
        latitude: categoryForm.latitude
          ? parseFloat(categoryForm.latitude)
          : null,
        longitude: categoryForm.longitude
          ? parseFloat(categoryForm.longitude)
          : null,
      };
      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, data);
      } else {
        await onAddCategory(data);
      }
      setCategoryErrors({}); // Clear errors on successful save
      resetCategoryForm();
      setShowCategoryForm(false);
    } catch (err) {
      // Parse backend validation errors
      if (err.response?.data?.errors) {
        const backendErrors = {};
        const errorData = err.response.data.errors;

        Object.keys(errorData).forEach((key) => {
          backendErrors[key] = errorData[key][0];
        });

        setCategoryErrors(backendErrors);
      } else {
        setAlertModal({
          isOpen: true,
          title: language === "ms" ? "Ralat" : "Error",
          message:
            err.response?.data?.message ||
            err.message ||
            (language === "ms"
              ? "Gagal menyimpan kategori"
              : "Failed to save category"),
          type: "error",
        });
      }
    }
  };

  const handleSaveTier = async (categoryId) => {
    try {
      const data = {
        ...tierForm,
        fee_amount: parseFloat(tierForm.fee_amount) * 100, // Convert to cents
      };
      await onAddTier(categoryId, data);
      resetTierForm();
    } catch (err) {
      setAlertModal({
        isOpen: true,
        title: language === "ms" ? "Ralat" : "Error",
        message:
          err.response?.data?.message ||
          err.message ||
          (language === "ms" ? "Gagal menyimpan tier" : "Failed to save tier"),
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Participant Categories
        </h3>
        <button
          type="button"
          onClick={() => setShowCategoryForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Category Form - Top (Add New Only) */}
      {showCategoryForm && !editingCategory && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-semibold text-blue-900 mb-3">New Category</h5>
          <div className="grid grid-cols-2 gap-4">
            {/* Category Name - Text Input */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "ms" ? "Nama Kategori *" : "Category Name *"}
              </label>
              <input
                type="text"
                value={categoryForm.category_name}
                onChange={(e) => {
                  setCategoryForm({
                    ...categoryForm,
                    category_name: e.target.value,
                  });
                  if (categoryErrors.category_name) {
                    setCategoryErrors((prev) => ({
                      ...prev,
                      category_name: undefined,
                    }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  categoryErrors.category_name
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="e.g., 10km Fun Run, 21km Marathon, Elite Category"
              />
              {categoryErrors.category_name && (
                <p className="text-red-600 text-sm mt-1">
                  {categoryErrors.category_name}
                </p>
              )}
            </div>

            {/* Custom Event Date/Time Checkbox */}
            <div className="col-span-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="has_custom_datetime"
                  checked={categoryForm.has_custom_datetime}
                  onChange={(e) => {
                    setCategoryForm({
                      ...categoryForm,
                      has_custom_datetime: e.target.checked,
                      event_date: e.target.checked
                        ? categoryForm.event_date
                        : "",
                      event_time: e.target.checked
                        ? categoryForm.event_time
                        : "",
                    });
                    // Clear errors if unchecking
                    if (!e.target.checked) {
                      setCategoryErrors((prev) => ({
                        ...prev,
                        event_date: undefined,
                        event_time: undefined,
                      }));
                    }
                  }}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded"
                />
                <label
                  htmlFor="has_custom_datetime"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  {language === "ms"
                    ? "Tetapkan tarikh dan masa acara khusus untuk kategori ini"
                    : "Set custom event date and time for this category"}
                </label>
              </div>
            </div>

            {/* Event Date & Time - Only show if checkbox is checked */}
            {categoryForm.has_custom_datetime && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ms" ? "Tarikh Acara *" : "Event Date *"}
                  </label>
                  <DateInput
                    value={categoryForm.event_date}
                    onChange={(value) => {
                      setCategoryForm({ ...categoryForm, event_date: value });
                      if (categoryErrors.event_date) {
                        setCategoryErrors((prev) => ({
                          ...prev,
                          event_date: undefined,
                        }));
                      }
                    }}
                    disablePast={true}
                    language={language}
                    error={categoryErrors.event_date}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ms" ? "Masa Acara *" : "Event Time *"}
                  </label>
                  <input
                    type="time"
                    value={categoryForm.event_time}
                    onChange={(e) => {
                      setCategoryForm({
                        ...categoryForm,
                        event_time: e.target.value,
                      });
                      if (categoryErrors.event_time) {
                        setCategoryErrors((prev) => ({
                          ...prev,
                          event_time: undefined,
                        }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      categoryErrors.event_time
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {categoryErrors.event_time && (
                    <p className="text-red-600 text-sm mt-1">
                      {categoryErrors.event_time}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Capacity Type Toggle */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ms" ? "Jenis Kapasiti *" : "Capacity Type *"}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="capacity_type"
                    value="unlimited"
                    checked={categoryForm.capacity_type === "unlimited"}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        capacity_type: e.target.value,
                        capacity: "",
                      })
                    }
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">
                    {language === "ms" ? "Tanpa Had" : "Unlimited Slots"}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="capacity_type"
                    value="limited"
                    checked={categoryForm.capacity_type === "limited"}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        capacity_type: e.target.value,
                      })
                    }
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">
                    {language === "ms" ? "Terhad" : "Limited Slots"}
                  </span>
                </label>
              </div>
            </div>

            {/* Capacity - Only show if limited */}
            {categoryForm.capacity_type === "limited" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "ms"
                    ? "Kapasiti Maksimum *"
                    : "Maximum Capacity *"}
                </label>
                <NumericInput
                  value={categoryForm.capacity}
                  onChange={(value) => {
                    setCategoryForm({ ...categoryForm, capacity: value });
                    if (categoryErrors.capacity) {
                      setCategoryErrors((prev) => ({
                        ...prev,
                        capacity: undefined,
                      }));
                    }
                  }}
                  placeholder="100"
                  language={language}
                  error={categoryErrors.capacity}
                />
              </div>
            )}

            {/* Category Location Checkbox */}
            <div className="col-span-2">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={categoryForm.has_category_location}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setCategoryForm({
                          ...categoryForm,
                          has_category_location: isChecked,
                          // Clear location fields when unchecking
                          location_type: isChecked
                            ? categoryForm.location_type
                            : "event_location",
                          location_name: isChecked
                            ? categoryForm.location_name
                            : "",
                          latitude: isChecked ? categoryForm.latitude : null,
                          longitude: isChecked ? categoryForm.longitude : null,
                          location_details: isChecked
                            ? categoryForm.location_details
                            : "",
                        });
                      }}
                      className="peer sr-only"
                    />
                    <div className="w-6 h-6 rounded-lg border-2 border-blue-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-200 flex items-center justify-center group-hover:border-blue-400">
                      {categoryForm.has_category_location && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">
                        {language === "ms"
                          ? "Lokasi Kategori Berbeza"
                          : "Different Category Location"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {language === "ms"
                        ? "Tetapkan lokasi khusus untuk kategori ini jika berbeza dari lokasi acara utama (cth: garisan permulaan yang berlainan)"
                        : "Set a specific location for this category if different from the main event location (e.g., different starting line)"}
                    </p>
                  </div>
                </label>

                {/* Location Picker - Inside gradient box when checked */}
                {categoryForm.has_category_location && (
                  <div className="mt-4 pt-4 border-t border-blue-200 space-y-3">
                    <SavedLocationPicker
                      value={{
                        address: categoryForm.location_name || "",
                        latitude: categoryForm.latitude,
                        longitude: categoryForm.longitude,
                      }}
                      onChange={(location) => {
                        setCategoryForm({
                          ...categoryForm,
                          location_type: location.address
                            ? "custom"
                            : "event_location",
                          location_name: location.address,
                          latitude: location.latitude,
                          longitude: location.longitude,
                        });
                      }}
                      placeholder="Select category location..."
                    />

                    {/* Location Details */}
                    {categoryForm.location_name && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location Details (Optional)
                        </label>
                        <textarea
                          value={categoryForm.location_details}
                          onChange={(e) =>
                            setCategoryForm({
                              ...categoryForm,
                              location_details: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          placeholder="Specific instructions (e.g., 'Meet at the main entrance')"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Additional information about this category..."
              />
            </div>

            {/* Has Fee Checkbox */}
            <div className="col-span-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="has_fee"
                  checked={categoryForm.has_fee}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      has_fee: e.target.checked,
                      base_fee: e.target.checked ? categoryForm.base_fee : "",
                    })
                  }
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded"
                />
                <label
                  htmlFor="has_fee"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  {language === "ms"
                    ? "Kenakan yuran pendaftaran untuk kategori ini"
                    : "Charge registration fee for this category"}
                </label>
              </div>
            </div>

            {/* Registration Fee - Only show if has_fee is checked */}
            {categoryForm.has_fee && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "ms"
                    ? "Yuran Pendaftaran (RM) *"
                    : "Registration Fee (RM) *"}
                  <span className="ml-2 text-xs text-gray-500">
                    (
                    {language === "ms"
                      ? "Jenis: Yuran Tetap"
                      : "Type: Fixed Fee"}
                    )
                  </span>
                </label>
                <FeeInput
                  value={categoryForm.base_fee}
                  onChange={(value) => {
                    setCategoryForm({ ...categoryForm, base_fee: value });
                    if (categoryErrors.base_fee) {
                      setCategoryErrors((prev) => ({
                        ...prev,
                        base_fee: undefined,
                      }));
                    }
                  }}
                  language={language}
                  error={categoryErrors.base_fee}
                  placeholder={
                    language === "ms"
                      ? "cth: 3000 (RM 30.00)"
                      : "e.g., 3000 (RM 30.00)"
                  }
                />
              </div>
            )}

            {/* Other Options Section */}
            <div className="col-span-2 pt-3 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Options
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryForm.has_bib}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        has_bib: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">
                    Use BIB Numbers for this category
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryForm.has_event_tshirt}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        has_event_tshirt: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">
                    Provide Event T-shirt
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryForm.has_finisher_tshirt}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        has_finisher_tshirt: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">
                    Provide Finisher T-shirt
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleSaveCategory}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
            >
              <Save className="h-4 w-4" />
              Save Category
            </button>
            <button
              type="button"
              onClick={resetCategoryForm}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      {categories.length === 0 && !showCategoryForm && (
        <div className="text-center py-8 text-gray-500">
          No categories added yet. Click "Add Category" to get started.
        </div>
      )}

      {categories.map((category) => (
        <div
          key={category.id}
          data-category-id={category.id}
          className="border border-gray-200 rounded-lg p-4"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h5 className="font-semibold text-gray-900">
                {category.category_name}
              </h5>

              {/* Event Date/Time Display */}
              {(category.event_date || category.event_time) && (
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {category.event_date}
                  {category.event_time && ` • ${category.event_time}`}
                </p>
              )}

              {/* Capacity Display */}
              <p className="text-sm text-gray-600 mt-1">
                {category.capacity_type === "unlimited" ? (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Unlimited Capacity
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Capacity: {category.capacity}
                  </span>
                )}
              </p>

              {/* Location Display */}
              {category.location_name && (
                <div className="mt-2 flex items-start gap-1 text-sm text-emerald-700">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{category.location_name}</p>
                    {category.location_details && (
                      <p className="text-xs text-gray-600 mt-0.5">
                        {category.location_details}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {category.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {category.description}
                </p>
              )}

              {/* Fee Badge */}
              {category.has_fee && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                    <DollarSign className="h-3 w-3" />
                    {category.fee_type === "fixed" ? (
                      <>Fixed: RM {(category.base_fee / 100).toFixed(2)}</>
                    ) : (
                      <>Tiered Pricing</>
                    )}
                  </span>
                </div>
              )}

              {/* Registration Options Badges */}
              {(category.has_event_tshirt ||
                category.has_finisher_tshirt ||
                category.has_bib) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {category.has_bib && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h10M7 12h10m-10 5h10"
                        />
                      </svg>
                      Uses BIB
                    </span>
                  )}
                  {category.has_event_tshirt && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      Event T-shirt
                    </span>
                  )}
                  {category.has_finisher_tshirt && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Finisher T-shirt
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(category);
                  setCategoryForm({
                    category_name: category.category_name,
                    event_date: category.event_date || "",
                    event_time: category.event_time || "",
                    capacity_type: category.capacity_type,
                    capacity: category.capacity || "",
                    has_category_location: !!category.location_name, // Auto-check if has location
                    location_type: category.location_type || "event_location",
                    location_name: category.location_name || "",
                    latitude: category.latitude,
                    longitude: category.longitude,
                    location_details: category.location_details || "",
                    has_fee: category.has_fee,
                    fee_type: category.fee_type || "",
                    base_fee: category.base_fee || "", // Already in cents from backend
                    description: category.description || "",
                    has_event_tshirt: category.has_event_tshirt || false,
                    has_finisher_tshirt: category.has_finisher_tshirt || false,
                    has_bib: category.has_bib ?? true,
                  });
                  // Inline edit form will show below
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title:
                      language === "ms"
                        ? "Padam Kategori?"
                        : "Delete Category?",
                    message:
                      language === "ms"
                        ? "Adakah anda pasti mahu memadam kategori ini dan semua tier berkaitan?"
                        : "Are you sure you want to delete this category and all its tiers?",
                    onConfirm: () => {
                      onRemoveCategory(category.id);
                      setConfirmModal({
                        isOpen: false,
                        title: "",
                        message: "",
                        onConfirm: () => {},
                      });
                    },
                  });
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Inline Category Edit Form */}
          <AnimatePresence>
            {editingCategory?.id === category.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                ref={categoryFormRef}
                className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 overflow-hidden"
              >
                <h5 className="font-semibold text-blue-900 mb-3">
                  Edit Category
                </h5>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category Name */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === "ms"
                        ? "Nama Kategori *"
                        : "Category Name *"}
                    </label>
                    <input
                      type="text"
                      value={categoryForm.category_name}
                      onChange={(e) => {
                        setCategoryForm({
                          ...categoryForm,
                          category_name: e.target.value,
                        });
                        if (categoryErrors.category_name) {
                          setCategoryErrors((prev) => ({
                            ...prev,
                            category_name: undefined,
                          }));
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        categoryErrors.category_name
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., 10km Fun Run, 21km Marathon"
                    />
                    {categoryErrors.category_name && (
                      <p className="text-red-600 text-sm mt-1">
                        {categoryErrors.category_name}
                      </p>
                    )}
                  </div>

                  {/* Custom Event Date/Time Checkbox */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        id="inline_has_custom_datetime"
                        checked={categoryForm.has_custom_datetime}
                        onChange={(e) => {
                          setCategoryForm({
                            ...categoryForm,
                            has_custom_datetime: e.target.checked,
                            event_date: e.target.checked
                              ? categoryForm.event_date
                              : "",
                            event_time: e.target.checked
                              ? categoryForm.event_time
                              : "",
                          });
                          if (!e.target.checked) {
                            setCategoryErrors((prev) => ({
                              ...prev,
                              event_date: undefined,
                              event_time: undefined,
                            }));
                          }
                        }}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded"
                      />
                      <label
                        htmlFor="inline_has_custom_datetime"
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        {language === "ms"
                          ? "Tetapkan tarikh dan masa acara khusus"
                          : "Set custom event date and time"}
                      </label>
                    </div>
                  </div>

                  {/* Event Date & Time */}
                  {categoryForm.has_custom_datetime && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {language === "ms"
                            ? "Tarikh Acara *"
                            : "Event Date *"}
                        </label>
                        <DateInput
                          value={categoryForm.event_date}
                          onChange={(value) => {
                            setCategoryForm({
                              ...categoryForm,
                              event_date: value,
                            });
                            if (categoryErrors.event_date) {
                              setCategoryErrors((prev) => ({
                                ...prev,
                                event_date: undefined,
                              }));
                            }
                          }}
                          disablePast={true}
                          language={language}
                          error={categoryErrors.event_date}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {language === "ms" ? "Masa Acara *" : "Event Time *"}
                        </label>
                        <input
                          type="time"
                          value={categoryForm.event_time}
                          onChange={(e) => {
                            setCategoryForm({
                              ...categoryForm,
                              event_time: e.target.value,
                            });
                            if (categoryErrors.event_time) {
                              setCategoryErrors((prev) => ({
                                ...prev,
                                event_time: undefined,
                              }));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            categoryErrors.event_time
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {categoryErrors.event_time && (
                          <p className="text-red-600 text-sm mt-1">
                            {categoryErrors.event_time}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Capacity Type */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === "ms"
                        ? "Jenis Kapasiti *"
                        : "Capacity Type *"}
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="inline_capacity_type"
                          value="unlimited"
                          checked={categoryForm.capacity_type === "unlimited"}
                          onChange={(e) =>
                            setCategoryForm({
                              ...categoryForm,
                              capacity_type: e.target.value,
                              capacity: "",
                            })
                          }
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">
                          {language === "ms" ? "Tanpa Had" : "Unlimited Slots"}
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="inline_capacity_type"
                          value="limited"
                          checked={categoryForm.capacity_type === "limited"}
                          onChange={(e) =>
                            setCategoryForm({
                              ...categoryForm,
                              capacity_type: e.target.value,
                            })
                          }
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">
                          {language === "ms" ? "Terhad" : "Limited Slots"}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Capacity Number */}
                  {categoryForm.capacity_type === "limited" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === "ms"
                          ? "Kapasiti Maksimum *"
                          : "Maximum Capacity *"}
                      </label>
                      <NumericInput
                        value={categoryForm.capacity}
                        onChange={(value) => {
                          setCategoryForm({ ...categoryForm, capacity: value });
                          if (categoryErrors.capacity) {
                            setCategoryErrors((prev) => ({
                              ...prev,
                              capacity: undefined,
                            }));
                          }
                        }}
                        placeholder="100"
                        language={language}
                        error={categoryErrors.capacity}
                      />
                    </div>
                  )}

                  {/* Category Location Checkbox */}
                  <div className="col-span-2">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={categoryForm.has_category_location}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setCategoryForm({
                                ...categoryForm,
                                has_category_location: isChecked,
                                location_type: isChecked
                                  ? categoryForm.location_type
                                  : "event_location",
                                location_name: isChecked
                                  ? categoryForm.location_name
                                  : "",
                                latitude: isChecked
                                  ? categoryForm.latitude
                                  : null,
                                longitude: isChecked
                                  ? categoryForm.longitude
                                  : null,
                                location_details: isChecked
                                  ? categoryForm.location_details
                                  : "",
                              });
                            }}
                            className="peer sr-only"
                          />
                          <div className="w-6 h-6 rounded-lg border-2 border-blue-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-200 flex items-center justify-center group-hover:border-blue-400">
                            {categoryForm.has_category_location && (
                              <Check className="h-4 w-4 text-white" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            <span className="font-semibold text-gray-900">
                              {language === "ms"
                                ? "Lokasi Kategori Berbeza"
                                : "Different Category Location"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            {language === "ms"
                              ? "Tetapkan lokasi khusus untuk kategori ini"
                              : "Set a specific location for this category"}
                          </p>
                        </div>
                      </label>

                      {categoryForm.has_category_location && (
                        <div className="mt-4 pt-4 border-t border-blue-200 space-y-3">
                          <SavedLocationPicker
                            value={{
                              address: categoryForm.location_name || "",
                              latitude: categoryForm.latitude,
                              longitude: categoryForm.longitude,
                            }}
                            onChange={(location) => {
                              setCategoryForm({
                                ...categoryForm,
                                location_type: location.address
                                  ? "custom"
                                  : "event_location",
                                location_name: location.address,
                                latitude: location.latitude,
                                longitude: location.longitude,
                              });
                            }}
                            placeholder="Select category location..."
                          />

                          {categoryForm.location_name && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location Details (Optional)
                              </label>
                              <textarea
                                value={categoryForm.location_details}
                                onChange={(e) =>
                                  setCategoryForm({
                                    ...categoryForm,
                                    location_details: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows={2}
                                placeholder="Specific instructions"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Additional information..."
                    />
                  </div>

                  {/* Has Fee Checkbox */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        id="inline_has_fee"
                        checked={categoryForm.has_fee}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            has_fee: e.target.checked,
                            base_fee: e.target.checked
                              ? categoryForm.base_fee
                              : "",
                          })
                        }
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded"
                      />
                      <label
                        htmlFor="inline_has_fee"
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        {language === "ms"
                          ? "Kenakan yuran pendaftaran"
                          : "Charge registration fee"}
                      </label>
                    </div>
                  </div>

                  {/* Registration Fee */}
                  {categoryForm.has_fee && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === "ms"
                          ? "Yuran Pendaftaran (RM) *"
                          : "Registration Fee (RM) *"}
                      </label>
                      <FeeInput
                        value={categoryForm.base_fee}
                        onChange={(value) => {
                          setCategoryForm({ ...categoryForm, base_fee: value });
                          if (categoryErrors.base_fee) {
                            setCategoryErrors((prev) => ({
                              ...prev,
                              base_fee: undefined,
                            }));
                          }
                        }}
                        language={language}
                        error={categoryErrors.base_fee}
                        placeholder={
                          language === "ms"
                            ? "cth: 3000 (RM 30.00)"
                            : "e.g., 3000 (RM 30.00)"
                        }
                      />
                    </div>
                  )}

                  {/* Registration Options Section */}
                  <div className="col-span-2 pt-3 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Options
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={categoryForm.has_bib}
                          onChange={(e) =>
                            setCategoryForm({
                              ...categoryForm,
                              has_bib: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">
                          Use BIB Numbers
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={categoryForm.has_event_tshirt}
                          onChange={(e) =>
                            setCategoryForm({
                              ...categoryForm,
                              has_event_tshirt: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">
                          Provide Event T-shirt
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={categoryForm.has_finisher_tshirt}
                          onChange={(e) =>
                            setCategoryForm({
                              ...categoryForm,
                              has_finisher_tshirt: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">
                          Provide Finisher T-shirt
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleSaveCategory}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                  >
                    <Save className="h-4 w-4" />
                    Save Category
                  </button>
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fee Tiers Section (keeping existing tier logic) */}
          {category.has_fee && category.fee_type === "tiered" && (
            <div className="ml-4 space-y-2 mt-4 pt-3 border-t">
              <div className="flex items-center justify-between">
                <h6 className="text-sm font-medium text-gray-700">Fee Tiers</h6>
                <button
                  type="button"
                  onClick={() => setShowTierForm(category.id)}
                  className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Tier
                </button>
              </div>

              {/* Tier Form (keeping existing) */}
              {showTierForm === category.id && (
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tier Type *
                      </label>
                      <select
                        value={tierForm.tier_type}
                        onChange={(e) =>
                          setTierForm({
                            ...tierForm,
                            tier_type: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                        required
                      >
                        <option value="">Select...</option>
                        {TIER_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tier Name *
                      </label>
                      <input
                        type="text"
                        value={tierForm.tier_name}
                        onChange={(e) =>
                          setTierForm({
                            ...tierForm,
                            tier_name: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                        placeholder="Early Bird Special"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Fee (RM) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={tierForm.fee_amount}
                        onChange={(e) =>
                          setTierForm({
                            ...tierForm,
                            fee_amount: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                        placeholder="25.00"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Valid From *
                      </label>
                      <input
                        type="date"
                        value={tierForm.valid_from}
                        onChange={(e) =>
                          setTierForm({
                            ...tierForm,
                            valid_from: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Valid Until *
                      </label>
                      <input
                        type="date"
                        value={tierForm.valid_until}
                        onChange={(e) =>
                          setTierForm({
                            ...tierForm,
                            valid_until: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => handleSaveTier(category.id)}
                      className="px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded"
                    >
                      Save Tier
                    </button>
                    <button
                      type="button"
                      onClick={resetTierForm}
                      className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Tiers List (keeping existing) */}
              {(feeTiers[category.id] || []).length === 0 &&
                showTierForm !== category.id && (
                  <div className="text-xs text-gray-500 italic">
                    No tiers added
                  </div>
                )}

              {(feeTiers[category.id] || []).map((tier) => (
                <div
                  key={tier.id}
                  className="bg-gray-50 rounded p-2 text-sm flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {tier.tier_name}
                    </div>
                    <div className="text-emerald-600 font-semibold">
                      RM {(tier.fee_amount / 100).toFixed(2)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                      <Calendar className="h-3 w-3" />
                      {tier.valid_from} to {tier.valid_until}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        title:
                          language === "ms" ? "Padam Tier?" : "Delete Tier?",
                        message:
                          language === "ms"
                            ? "Adakah anda pasti mahu memadam tier ini?"
                            : "Are you sure you want to delete this tier?",
                        onConfirm: () => {
                          onRemoveTier(tier.id);
                          setConfirmModal({
                            isOpen: false,
                            title: "",
                            message: "",
                            onConfirm: () => {},
                          });
                        },
                      });
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    {" "}
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

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
