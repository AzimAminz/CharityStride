"use client";

import { useState } from "react";
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
} from "lucide-react";
import SavedLocationPicker from "../SavedLocationPicker";
import { FEE_TYPES, TIER_TYPES } from "../../lib/api/participant";
import { NumericInput, FeeInput, DateInput } from "../inputs";
import { useLanguage } from "../../contexts/LanguageContext";

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
  const [categoryForm, setCategoryForm] = useState({
    category_name: "",
    event_date: "",
    event_time: "",
    capacity_type: "limited",
    capacity: "",
    location_type: "event_location",
    location_name: "",
    latitude: null,
    longitude: null,
    location_details: "",
    has_fee: false,
    fee_type: "",
    base_fee: "",
    description: "",
    has_event_tshirt: false,
    has_finisher_tshirt: false,
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
    setCategoryForm({
      category_name: "",
      event_date: "",
      event_time: "",
      capacity_type: "limited",
      capacity: "",
      location_type: "event_location",
      location_name: "",
      latitude: null,
      longitude: null,
      location_details: "",
      has_fee: false,
      fee_type: "",
      base_fee: "",
      description: "",
      has_event_tshirt: false,
      has_finisher_tshirt: false,
    });
    setEditingCategory(null);
    setShowCategoryForm(false);
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

  const handleSaveCategory = async () => {
    try {
      const data = {
        ...categoryForm,
        capacity: categoryForm.capacity
          ? parseInt(categoryForm.capacity)
          : null,
        base_fee: categoryForm.base_fee
          ? parseInt(categoryForm.base_fee)
          : null, // Already in cents from FeeInput
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
      resetCategoryForm();
    } catch (err) {
      alert(err.message);
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
      alert(err.message);
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

      {/* Category Form */}
      {showCategoryForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-semibold text-blue-900 mb-3">
            {editingCategory ? "Edit Category" : "New Category"}
          </h5>
          <div className="grid grid-cols-2 gap-4">
            {/* Category Name - Text Input */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={categoryForm.category_name}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    category_name: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10km Fun Run, 21km Marathon, Elite Category"
                required
              />
            </div>

            {/* Event Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Date
              </label>
              <DateInput
                value={categoryForm.event_date}
                onChange={(value) =>
                  setCategoryForm({
                    ...categoryForm,
                    event_date: value,
                  })
                }
                disablePast={true}
                language={language}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Time
              </label>
              <input
                type="time"
                value={categoryForm.event_time}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    event_time: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Capacity Type Toggle */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity Type *
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
                  <span className="text-sm text-gray-700">Unlimited Slots</span>
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
                  <span className="text-sm text-gray-700">Limited Slots</span>
                </label>
              </div>
            </div>

            {/* Capacity Number - Only show if limited */}
            {categoryForm.capacity_type === "limited" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity *
                </label>
                <NumericInput
                  value={categoryForm.capacity}
                  onChange={(value) =>
                    setCategoryForm({
                      ...categoryForm,
                      capacity: value,
                    })
                  }
                  placeholder="e.g., 500"
                  language={language}
                  required
                />
              </div>
            )}

            {/* Location Picker */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Location
              </label>
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
                placeholder="Use event location or select custom location..."
              />
            </div>

            {/* Location Details */}
            {categoryForm.location_name && (
              <div className="col-span-2">
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
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="has_fee"
                  checked={categoryForm.has_fee}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      has_fee: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="has_fee"
                  className="text-sm font-medium text-gray-700"
                >
                  This category has a registration fee
                </label>
              </div>
            </div>

            {/* Fee Configuration */}
            {categoryForm.has_fee && (
              <>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fee Type *
                  </label>
                  <select
                    value={categoryForm.fee_type}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        fee_type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select...</option>
                    {FEE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {categoryForm.fee_type === "fixed" && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Fee (in cents) *
                    </label>
                    <FeeInput
                      value={categoryForm.base_fee}
                      onChange={(value) =>
                        setCategoryForm({
                          ...categoryForm,
                          base_fee: value,
                        })
                      }
                      placeholder={
                        language === "ms"
                          ? "cth: 3000 (RM 30.00)"
                          : "e.g., 3000 (RM 30.00)"
                      }
                      language={language}
                      required
                    />
                    
                  </div>
                )}
              </>
            )}

            {/* T-shirt Options */}
            <div className="col-span-2 pt-3 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                T-shirt Options
              </label>
              <div className="space-y-2">
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
                    Provide Event T-shirt for this category
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
                    Provide Finisher T-shirt for this category
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

              {/* T-shirt Badges */}
              {(category.has_event_tshirt || category.has_finisher_tshirt) && (
                <div className="mt-2 flex gap-2">
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
                  });
                  setShowCategoryForm(true);
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Delete this category and all its tiers?")) {
                    onRemoveCategory(category.id);
                  }
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

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
                      if (confirm("Delete this tier?")) {
                        onRemoveTier(category.id, tier.id);
                      }
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
