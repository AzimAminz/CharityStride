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
} from "lucide-react";
import {
  PARTICIPATION_TYPES,
  SLOT_LIMIT_TYPES,
  CATEGORY_NAMES,
  FEE_TYPES,
  TIER_TYPES,
} from "../../lib/api/participant";

/**
 * Component for managing participant categories and pricing
 */
export default function ParticipantCategoryManager({
  config = {
    participation_type: "free_event",
    slot_limit_type: "unlimited",
    total_slots: null,
  },
  categories = [],
  feeTiers = {},
  onUpdateConfig,
  onAddCategory,
  onUpdateCategory,
  onRemoveCategory,
  onAddTier,
  onUpdateTier,
  onRemoveTier,
}) {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    category_name: "",
    capacity: "",
    has_fee: false,
    fee_type: "",
    base_fee: "",
    description: "",
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
      capacity: "",
      has_fee: false,
      fee_type: "",
      base_fee: "",
      description: "",
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
        base_fee: categoryForm.base_fee
          ? parseFloat(categoryForm.base_fee) * 100
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
      <h3 className="text-lg font-semibold text-gray-900">
        Participant Configuration
      </h3>

      {/* Config Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Participation Type *
            </label>
            <select
              value={config.participation_type}
              onChange={(e) =>
                onUpdateConfig({
                  ...config,
                  participation_type: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              {PARTICIPATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slot Limit Type *
            </label>
            <select
              value={config.slot_limit_type}
              onChange={(e) =>
                onUpdateConfig({ ...config, slot_limit_type: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              {SLOT_LIMIT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {config.slot_limit_type === "limited" && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Slots *
              </label>
              <input
                type="number"
                value={config.total_slots || ""}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    total_slots: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="100"
                required
              />
            </div>
          )}
        </div>
      </div>

      {/* Categories Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">
            Participant Categories
          </h4>
          <button
            type="button"
            onClick={() => setShowCategoryForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>

        {/* Category Form */}
        {showCategoryForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h5 className="font-semibold text-blue-900 mb-3">
              {editingCategory ? "Edit Category" : "New Category"}
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <select
                  value={categoryForm.category_name}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      category_name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select...</option>
                  {CATEGORY_NAMES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  value={categoryForm.capacity}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      capacity: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional limit for this category"
                />
              </div>

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
                        Base Fee (RM) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={categoryForm.base_fee}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            base_fee: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="30.00"
                        required
                      />
                    </div>
                  )}
                </>
              )}
            </div>

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
            className="border border-gray-200 rounded-lg p-4 mb-3"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h5 className="font-semibold text-gray-900">
                  {CATEGORY_NAMES.find(
                    (c) => c.value === category.category_name
                  )?.label || category.category_name}
                </h5>
                {category.capacity && (
                  <p className="text-sm text-gray-600">
                    Capacity: {category.capacity}
                  </p>
                )}
                {category.description && (
                  <p className="text-sm text-gray-600">
                    {category.description}
                  </p>
                )}
                {category.has_fee && (
                  <div className="mt-1">
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
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(category);
                    setCategoryForm({
                      category_name: category.category_name,
                      capacity: category.capacity || "",
                      has_fee: category.has_fee,
                      fee_type: category.fee_type || "",
                      base_fee: category.base_fee
                        ? category.base_fee / 100
                        : "",
                      description: category.description || "",
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

            {/* Fee Tiers (only if tiered pricing) */}
            {category.has_fee && category.fee_type === "tiered" && (
              <div className="ml-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h6 className="text-sm font-medium text-gray-700">
                    Fee Tiers
                  </h6>
                  <button
                    type="button"
                    onClick={() => setShowTierForm(category.id)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Tier
                  </button>
                </div>

                {/* Tier Form */}
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

                {/* Tiers List */}
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
    </div>
  );
}
