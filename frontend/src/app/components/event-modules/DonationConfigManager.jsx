"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  DollarSign,
  Package,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { FeeInput, NumericInput } from "../inputs";
import { useLanguage } from "../../contexts/LanguageContext";
import { ITEM_CATEGORIES, QUANTITY_TYPES } from "../../lib/api/donation";
import ConfirmModal from "../ConfirmModal";
import AlertModal from "../AlertModal";

/**
 * Component for configuring donation module
 */
export default function DonationConfigManager({
  config,
  moneyOptions = [],
  itemOptions = [],
  onUpdateConfig,
  onAddMoneyOption,
  onUpdateMoneyOption,
  onRemoveMoneyOption,
  onAddItemOption,
  onUpdateItemOption,
  onRemoveItemOption,
}) {
  const { language } = useLanguage();
  const [showMoneyForm, setShowMoneyForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingMoneyId, setEditingMoneyId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);

  // Validation errors
  const [moneyValidationErrors, setMoneyValidationErrors] = useState({});
  const [itemValidationErrors, setItemValidationErrors] = useState({});

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

  const [moneyForm, setMoneyForm] = useState({
    is_free_amount: false,
    suggested_amount: "", // In RM, will convert to cents
    description: "",
  });

  const [itemForm, setItemForm] = useState({
    item_category: "",
    item_name: "",
    item_description: "",
    quantity_type: "fixed",
    target_quantity: "",
    unit: "",
  });

  const resetMoneyForm = () => {
    setMoneyForm({
      is_free_amount: false,
      suggested_amount: "",
      description: "",
    });
    setShowMoneyForm(false);
    setEditingMoneyId(null);
  };

  const resetItemForm = () => {
    setItemForm({
      item_category: "",
      item_name: "",
      item_description: "",
      quantity_type: "fixed",
      target_quantity: "",
      unit: "",
    });
    setEditingItemId(null);
    setShowItemForm(false);
  };

  const handleEditMoneyOption = (option) => {
    setEditingMoneyId(option.id);
    setMoneyForm({
      is_free_amount: option.suggested_amount === null,
      suggested_amount: option.suggested_amount
        ? option.suggested_amount.toString() // Keep as cents (200)
        : "",
      description: option.description || "",
    });
    setShowMoneyForm(true); // Show inline form for editing
  };

  const handleEditItemOption = (option) => {
    setEditingItemId(option.id);
    setItemForm({
      item_category: option.item_category || "",
      item_name: option.item_name || "",
      item_description: option.item_description || "",
      quantity_type: option.quantity_type || "fixed",
      target_quantity: option.target_quantity
        ? option.target_quantity.toString()
        : "",
      unit: option.unit || "",
    });
    setShowItemForm(true); // Hide add form when editing
  };

  // Validate money form
  const validateMoneyForm = () => {
    const errors = {};

    if (!moneyForm.is_free_amount) {
      if (!moneyForm.suggested_amount || moneyForm.suggested_amount === "0") {
        errors.suggested_amount =
          language === "ms"
            ? "Sila masukkan jumlah derma"
            : "Please enter a donation amount";
      } else if (parseInt(moneyForm.suggested_amount) < 100) {
        errors.suggested_amount =
          language === "ms"
            ? "Jumlah minimum adalah RM 1.00 (100)"
            : "Minimum amount is RM 1.00 (type 100)";
      }
    }

    if (moneyForm.is_free_amount && !moneyForm.description.trim()) {
      errors.description =
        language === "ms"
          ? "Sila berikan keterangan untuk pilihan jumlah bebas"
          : "Please provide a description for free amount option";
    }

    setMoneyValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveMoneyOption = async () => {
    // Clear previous errors
    setMoneyValidationErrors({});

    // Validate form
    if (!validateMoneyForm()) {
      return; // Don't submit if validation fails
    }

    try {
      // FeeInput already sends cents, no need to multiply by 100
      const data = {
        suggested_amount: moneyForm.is_free_amount
          ? null
          : parseInt(moneyForm.suggested_amount), // Just parse as integer
        description:
          moneyForm.description ||
          (moneyForm.is_free_amount ? "Any amount" : null),
      };

      if (editingMoneyId) {
        await onUpdateMoneyOption(editingMoneyId, data);
      } else {
        await onAddMoneyOption(data);
      }
      resetMoneyForm();
      setShowMoneyForm(false); // Close modal
    } catch (err) {
      // Parse backend errors
      if (err.response?.data?.errors) {
        // Laravel validation errors
        const backendErrors = {};
        const errorData = err.response.data.errors;

        Object.keys(errorData).forEach((key) => {
          backendErrors[key] = errorData[key][0]; // Get first error message
        });

        setMoneyValidationErrors(backendErrors);
      } else if (err.response?.data?.message) {
        // Show backend message
        setAlertModal({
          isOpen: true,
          title: language === "ms" ? "Ralat" : "Error",
          message: err.response.data.message,
          type: "error",
        });
      } else {
        // Generic error
        setAlertModal({
          isOpen: true,
          title: language === "ms" ? "Ralat" : "Error",
          message:
            language === "ms"
              ? "Ralat tidak dijangka. Sila cuba lagi."
              : "An unexpected error occurred. Please try again.",
          type: "error",
        });
      }
    }
  };

  // Item validation
  const validateItemForm = () => {
    const errors = {};

    if (!itemForm.item_category?.trim()) {
      errors.item_category =
        language === "ms" ? "Kategori diperlukan" : "Category is required";
    }

    if (!itemForm.item_name?.trim()) {
      errors.item_name =
        language === "ms" ? "Nama item diperlukan" : "Item name is required";
    }

    if (!itemForm.quantity_type) {
      errors.quantity_type =
        language === "ms"
          ? "Jenis kuantiti diperlukan"
          : "Quantity type is required";
    }

    if (
      itemForm.quantity_type === "fixed" &&
      (!itemForm.target_quantity || itemForm.target_quantity < 1)
    ) {
      errors.target_quantity =
        language === "ms"
          ? "Kuantiti mesti sekurang-kurangnya 1"
          : "Quantity must be at least 1";
    }

    // Unit is ALWAYS required
    if (!itemForm.unit?.trim()) {
      errors.unit = language === "ms" ? "Unit diperlukan" : "Unit is required";
    }

    return errors;
  };

  const handleSaveItemOption = async () => {
    // Client-side validation
    const errors = validateItemForm();
    if (Object.keys(errors).length > 0) {
      setItemValidationErrors(errors);
      return;
    }

    try {
      if (editingItemId) {
        await onUpdateItemOption(editingItemId, itemForm);
      } else {
        await onAddItemOption(itemForm);
      }
      setItemValidationErrors({});
      resetItemForm();
    } catch (err) {
      // Parse backend validation errors
      if (err.response?.data?.errors) {
        const backendErrors = {};
        const errorData = err.response.data.errors;

        Object.keys(errorData).forEach((key) => {
          backendErrors[key] = errorData[key][0];
        });

        setItemValidationErrors(backendErrors);
      } else {
        setAlertModal({
          isOpen: true,
          title: language === "ms" ? "Ralat" : "Error",
          message:
            err.response?.data?.message ||
            err.message ||
            (language === "ms"
              ? "Gagal menyimpan pilihan item"
              : "Failed to save item option"),
          type: "error",
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {language === "ms" ? "Konfigurasi Derma" : "Donation Configuration"}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {language === "ms"
            ? "Tetapkan pilihan derma wang dan item untuk acara ini"
            : "Configure money and item donation options for this event"}
        </p>
      </div>

      {/* Donation Type Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="accepts_money"
            checked={config.accepts_money}
            onChange={(e) =>
              onUpdateConfig({ ...config, accepts_money: e.target.checked })
            }
            className="h-4 w-4 text-emerald-600"
          />
          <label
            htmlFor="accepts_money"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            <DollarSign className="inline h-4 w-4 mr-1" />
            Accept Money Donations
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="accepts_items"
            checked={config.accepts_items}
            onChange={(e) =>
              onUpdateConfig({ ...config, accepts_items: e.target.checked })
            }
            className="h-4 w-4 text-blue-600"
          />
          <label
            htmlFor="accepts_items"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            <Package className="h-4 w-4 inline mr-1" />
            Accept Item Donations
          </label>
        </div>
      </div>

      {/* Money Donations Section */}
      {config.accepts_money && (
        <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-emerald-900">
              {language === "ms"
                ? "Pilihan Derma Wang"
                : "Money Donation Options"}
            </h4>
            <button
              type="button"
              onClick={() => {
                resetMoneyForm();
                setShowMoneyForm(true);
              }}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
            >
              <Plus className="h-3 w-3" />
              {language === "ms" ? "Tambah Pilihan" : "Add Option"}
            </button>
          </div>

          {/* Inline Money Form */}
          {showMoneyForm && (
            <div className="bg-white border border-emerald-300 rounded-lg p-4 mb-4">
              <div className="space-y-4">
                {/* Free Amount Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_free_amount"
                    checked={moneyForm.is_free_amount}
                    onChange={(e) =>
                      setMoneyForm({
                        ...moneyForm,
                        is_free_amount: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_free_amount"
                    className="text-sm font-medium text-gray-700"
                  >
                    {language === "ms"
                      ? "Benarkan penderma pilih sebarang jumlah"
                      : "Allow donors to choose any amount (free amount)"}
                  </label>
                </div>

                {/* Suggested Amount */}
                {!moneyForm.is_free_amount && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === "ms"
                        ? "Jumlah Dicadangkan *"
                        : "Suggested Amount *"}
                    </label>
                    <FeeInput
                      value={moneyForm.suggested_amount}
                      onChange={(value) => {
                        setMoneyForm({ ...moneyForm, suggested_amount: value });
                        if (moneyValidationErrors.suggested_amount) {
                          setMoneyValidationErrors({
                            ...moneyValidationErrors,
                            suggested_amount: null,
                          });
                        }
                      }}
                      placeholder="0.00"
                      language={language}
                      error={moneyValidationErrors.suggested_amount}
                      showHelper={true}
                    />
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ms" ? "Keterangan" : "Description"}{" "}
                    {!moneyForm.is_free_amount && "(Optional)"}
                  </label>
                  <input
                    type="text"
                    value={moneyForm.description}
                    onChange={(e) => {
                      setMoneyForm({
                        ...moneyForm,
                        description: e.target.value,
                      });
                      if (moneyValidationErrors.description) {
                        setMoneyValidationErrors({
                          ...moneyValidationErrors,
                          description: null,
                        });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                      moneyValidationErrors.description
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    }`}
                    placeholder={
                      moneyForm.is_free_amount
                        ? language === "ms"
                          ? "cth: Sumbangan Umum"
                          : "e.g., General Donation"
                        : language === "ms"
                        ? "cth: Penaja Gangsa"
                        : "e.g., Bronze Sponsor"
                    }
                  />
                  {moneyValidationErrors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {moneyValidationErrors.description}
                    </p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveMoneyOption}
                    className="flex items-center gap-1 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                  >
                    <Save className="h-3 w-3" />
                    {language === "ms" ? "Simpan" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetMoneyForm();
                      setShowMoneyForm(false);
                      setMoneyValidationErrors({});
                    }}
                    className="flex items-center gap-1 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                  >
                    <X className="h-3 w-3" />
                    {language === "ms" ? "Batal" : "Cancel"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Money Options List */}
          {moneyOptions.length === 0 && (
            <div className="text-sm text-gray-500 italic">
              No money options added
            </div>
          )}

          <div className="space-y-2">
            {moneyOptions.map((option) => (
              <div key={option.id} className="bg-white rounded p-3">
                {/* Display mode */}
                <div className="flex items-start justify-between">
                  <div>
                    {option.suggested_amount ? (
                      <div className="text-emerald-600 font-semibold">
                        RM {(option.suggested_amount / 100).toFixed(2)}
                      </div>
                    ) : (
                      <div className="text-emerald-600 font-semibold">
                        Free Amount (Any amount)
                      </div>
                    )}
                    {option.description && (
                      <div className="text-sm text-gray-600">
                        {option.description}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditMoneyOption(option)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit this option"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setConfirmModal({
                          isOpen: true,
                          title:
                            language === "ms"
                              ? "Padam Pilihan?"
                              : "Delete Option?",
                          message:
                            language === "ms"
                              ? "Adakah anda pasti mahu memadam pilihan derma wang ini?"
                              : "Are you sure you want to delete this money donation option?",
                          onConfirm: async () => {
                            try {
                              await onRemoveMoneyOption(option.id);
                            } catch (err) {
                              setAlertModal({
                                isOpen: true,
                                title: language === "ms" ? "Ralat" : "Error",
                                message:
                                  err.response?.data?.message ||
                                  err.message ||
                                  (language === "ms"
                                    ? "Gagal memadam pilihan"
                                    : "Failed to delete option"),
                                type: "error",
                              });
                            }
                          },
                        });
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title={language === "ms" ? "Padam" : "Delete"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Item Donations Section */}
      {config.accepts_items && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-blue-900">
              Item Donation Options
            </h4>
            <button
              type="button"
              onClick={() => {
                setEditingItemId(null); // Clear any editing state
                resetItemForm(); // Reset to empty form
                setShowItemForm(true);
              }}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Plus className="h-3 w-3" />
              Add Item
            </button>
          </div>

          {/* Item Form - Only show if adding new (not editing existing) */}
          {showItemForm && !editingItemId && (
            <div className="bg-white border border-blue-300 rounded-lg p-3 mb-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ms" ? "Kategori *" : "Category *"}
                  </label>
                  <select
                    value={itemForm.item_category}
                    onChange={(e) => {
                      setItemForm({
                        ...itemForm,
                        item_category: e.target.value,
                      });
                      // Clear error when changing
                      if (itemValidationErrors.item_category) {
                        setItemValidationErrors((prev) => ({
                          ...prev,
                          item_category: undefined,
                        }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      itemValidationErrors.item_category
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">
                      {language === "ms" ? "Pilih kategori" : "Select category"}
                    </option>
                    {ITEM_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {itemValidationErrors.item_category && (
                    <p className="text-red-600 text-sm mt-1">
                      {itemValidationErrors.item_category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ms" ? "Nama Item *" : "Item Name *"}
                  </label>
                  <input
                    type="text"
                    value={itemForm.item_name}
                    onChange={(e) => {
                      setItemForm({ ...itemForm, item_name: e.target.value });
                      if (itemValidationErrors.item_name) {
                        setItemValidationErrors((prev) => ({
                          ...prev,
                          item_name: undefined,
                        }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      itemValidationErrors.item_name
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder={
                      language === "ms"
                        ? "Beras, Botol Air"
                        : "Rice, Water Bottles"
                    }
                  />
                  {itemValidationErrors.item_name && (
                    <p className="text-red-600 text-sm mt-1">
                      {itemValidationErrors.item_name}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ms" ? "Keterangan" : "Description"}
                    <span className="text-gray-400 text-xs ml-1">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    value={itemForm.item_description}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        item_description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder={
                      language === "ms"
                        ? "Butiran tambahan..."
                        : "Additional details..."
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ms" ? "Jenis Kuantiti *" : "Quantity Type *"}
                  </label>
                  <select
                    value={itemForm.quantity_type}
                    onChange={(e) => {
                      setItemForm({
                        ...itemForm,
                        quantity_type: e.target.value,
                        // Clear quantity when changing type to avoid confusion
                        target_quantity: "",
                      });
                      if (itemValidationErrors.quantity_type) {
                        setItemValidationErrors((prev) => ({
                          ...prev,
                          quantity_type: undefined,
                        }));
                      }
                      // Also clear quantity error if exists
                      if (itemValidationErrors.target_quantity) {
                        setItemValidationErrors((prev) => ({
                          ...prev,
                          target_quantity: undefined,
                        }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      itemValidationErrors.quantity_type
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">
                      {language === "ms" ? "Pilih..." : "Select..."}
                    </option>
                    {QUANTITY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {itemValidationErrors.quantity_type && (
                    <p className="text-red-600 text-sm mt-1">
                      {itemValidationErrors.quantity_type}
                    </p>
                  )}
                </div>

                {itemForm.quantity_type === "fixed" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === "ms" ? "Kuantiti *" : "Quantity *"}
                    </label>
                    <NumericInput
                      value={itemForm.target_quantity}
                      onChange={(value) => {
                        setItemForm({ ...itemForm, target_quantity: value });
                        if (itemValidationErrors.target_quantity) {
                          setItemValidationErrors((prev) => ({
                            ...prev,
                            target_quantity: undefined,
                          }));
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        itemValidationErrors.target_quantity
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="100"
                    />
                    {itemValidationErrors.target_quantity && (
                      <p className="text-red-600 text-sm mt-1">
                        {itemValidationErrors.target_quantity}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ms" ? "Unit *" : "Unit *"}
                  </label>
                  <input
                    type="text"
                    value={itemForm.unit}
                    onChange={(e) => {
                      setItemForm({ ...itemForm, unit: e.target.value });
                      if (itemValidationErrors.unit) {
                        setItemValidationErrors((prev) => ({
                          ...prev,
                          unit: undefined,
                        }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      itemValidationErrors.unit
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder={
                      language === "ms"
                        ? "kg, pek, botol"
                        : "kg, packs, bottles"
                    }
                  />
                  {itemValidationErrors.unit && (
                    <p className="text-red-600 text-sm mt-1">
                      {itemValidationErrors.unit}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleSaveItemOption}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  <Save className="h-3 w-3" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={resetItemForm}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Item Options List */}
          {itemOptions.length === 0 && !showItemForm && (
            <div className="text-sm text-gray-500 italic">
              No item options added
            </div>
          )}

          <div className="space-y-2">
            {itemOptions.map((option) => (
              <div key={option.id} className="bg-white rounded p-3">
                {editingItemId === option.id ? (
                  // Edit Form - shown inline when editing
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={itemForm.item_category}
                        onChange={(e) =>
                          setItemForm({
                            ...itemForm,
                            item_category: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select...</option>
                        {ITEM_CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={itemForm.item_name}
                        onChange={(e) =>
                          setItemForm({
                            ...itemForm,
                            item_name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Rice, Water Bottles"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={itemForm.item_description}
                        onChange={(e) =>
                          setItemForm({
                            ...itemForm,
                            item_description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="Additional details..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity Type *
                      </label>
                      <select
                        value={itemForm.quantity_type}
                        onChange={(e) =>
                          setItemForm({
                            ...itemForm,
                            quantity_type: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select...</option>
                        {QUANTITY_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {itemForm.quantity_type === "fixed" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Quantity *
                        </label>
                        <input
                          type="number"
                          value={itemForm.target_quantity}
                          onChange={(e) =>
                            setItemForm({
                              ...itemForm,
                              target_quantity: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="100"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit *
                      </label>
                      <input
                        type="text"
                        value={itemForm.unit}
                        onChange={(e) =>
                          setItemForm({ ...itemForm, unit: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="kg, packs, bottles"
                        required
                      />
                    </div>

                    <div className="col-span-2 flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveItemOption}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                      >
                        <Save className="h-3 w-3" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={resetItemForm}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                      >
                        <X className="h-3 w-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Mode - normal view with edit and delete buttons
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {option.item_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {
                          ITEM_CATEGORIES.find(
                            (c) => c.value === option.item_category
                          )?.label
                        }
                      </div>
                      {option.item_description && (
                        <div className="text-xs text-gray-500">
                          {option.item_description}
                        </div>
                      )}
                      <div className="text-xs text-gray-600 mt-1">
                        {option.quantity_type === "fixed" ? (
                          <>
                            Target: {option.target_quantity} {option.unit}
                          </>
                        ) : (
                          <>
                            Flexible quantity
                            {option.unit && ` (${option.unit})`}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditItemOption(option)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit this option"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setConfirmModal({
                            isOpen: true,
                            title:
                              language === "ms"
                                ? "Padam Item?"
                                : "Delete Item?",
                            message:
                              language === "ms"
                                ? "Adakah anda pasti mahu memadam item derma ini?"
                                : "Are you sure you want to delete this item donation option?",
                            onConfirm: async () => {
                              try {
                                await onRemoveItemOption(option.id);
                              } catch (err) {
                                setAlertModal({
                                  isOpen: true,
                                  title: language === "ms" ? "Ralat" : "Error",
                                  message:
                                    err.response?.data?.message ||
                                    err.message ||
                                    (language === "ms"
                                      ? "Gagal memadam item"
                                      : "Failed to delete item"),
                                  type: "error",
                                });
                              }
                            },
                          });
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title={language === "ms" ? "Padam" : "Delete"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!config.accepts_money && !config.accepts_items && (
        <div className="text-center py-8 text-gray-500">
          Enable money or item donations to configure options.
        </div>
      )}

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
