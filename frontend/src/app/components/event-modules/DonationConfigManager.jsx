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
import {
  AMOUNT_TYPES,
  ITEM_CATEGORIES,
  QUANTITY_TYPES,
} from "../../lib/api/donation";

/**
 * Component for configuring donation module
 */
export default function DonationConfigManager({
  config = { accepts_money: false, accepts_items: false },
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
  const [showMoneyForm, setShowMoneyForm] = useState(false);
  const [moneyForm, setMoneyForm] = useState({
    amount_type: "",
    amount: "",
    package_name: "",
    package_description: "",
  });

  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState({
    item_category: "",
    item_name: "",
    item_description: "",
    quantity_type: "",
    target_quantity: "",
    unit: "",
  });

  const resetMoneyForm = () => {
    setMoneyForm({
      amount_type: "",
      amount: "",
      package_name: "",
      package_description: "",
    });
    setShowMoneyForm(false);
  };

  const resetItemForm = () => {
    setItemForm({
      item_category: "",
      item_name: "",
      item_description: "",
      quantity_type: "",
      target_quantity: "",
      unit: "",
    });
    setShowItemForm(false);
  };

  const handleSaveMoneyOption = async () => {
    try {
      // Convert amount to cents for storage
      const data = {
        ...moneyForm,
        amount: moneyForm.amount ? parseFloat(moneyForm.amount) * 100 : null,
      };
      await onAddMoneyOption(data);
      resetMoneyForm();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveItemOption = async () => {
    try {
      await onAddItemOption(itemForm);
      resetItemForm();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Donation Configuration
      </h3>

      {/* Donation Type Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="accepts_money"
            checked={config.accepts_money}
            onChange={(e) =>
              onUpdateConfig({ ...config, accepts_money: e.target.checked })
            }
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
          />
          <label
            htmlFor="accepts_money"
            className="text-sm font-medium text-gray-700 flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Accept Money Donations
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="accepts_items"
            checked={config.accepts_items}
            onChange={(e) =>
              onUpdateConfig({ ...config, accepts_items: e.target.checked })
            }
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
          />
          <label
            htmlFor="accepts_items"
            className="text-sm font-medium text-gray-700 flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Accept Item Donations
          </label>
        </div>
      </div>

      {/* Money Donations Section */}
      {config.accepts_money && (
        <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-emerald-900">
              Money Donation Options
            </h4>
            <button
              type="button"
              onClick={() => setShowMoneyForm(true)}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
            >
              <Plus className="h-3 w-3" />
              Add Option
            </button>
          </div>

          {/* Money Option Form */}
          {showMoneyForm && (
            <div className="bg-white border border-emerald-300 rounded-lg p-3 mb-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount Type *
                  </label>
                  <select
                    value={moneyForm.amount_type}
                    onChange={(e) =>
                      setMoneyForm({
                        ...moneyForm,
                        amount_type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select...</option>
                    {AMOUNT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {(moneyForm.amount_type === "fixed" ||
                  moneyForm.amount_type === "package") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (RM) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={moneyForm.amount}
                      onChange={(e) =>
                        setMoneyForm({ ...moneyForm, amount: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="50.00"
                      required
                    />
                  </div>
                )}

                {moneyForm.amount_type === "package" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Package Name *
                      </label>
                      <input
                        type="text"
                        value={moneyForm.package_name}
                        onChange={(e) =>
                          setMoneyForm({
                            ...moneyForm,
                            package_name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="Bronze Package"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={moneyForm.package_description}
                        onChange={(e) =>
                          setMoneyForm({
                            ...moneyForm,
                            package_description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        rows={2}
                        placeholder="What's included in this package?"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleSaveMoneyOption}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded"
                >
                  <Save className="h-3 w-3" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={resetMoneyForm}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Money Options List */}
          {moneyOptions.length === 0 && !showMoneyForm && (
            <div className="text-sm text-gray-500 italic">
              No money options added
            </div>
          )}

          <div className="space-y-2">
            {moneyOptions.map((option) => (
              <div
                key={option.id}
                className="bg-white rounded p-3 flex items-start justify-between"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {
                      AMOUNT_TYPES.find((t) => t.value === option.amount_type)
                        ?.label
                    }
                  </div>
                  {option.amount && (
                    <div className="text-emerald-600 font-semibold">
                      RM {(option.amount / 100).toFixed(2)}
                    </div>
                  )}
                  {option.package_name && (
                    <div className="text-sm text-gray-600">
                      {option.package_name}
                    </div>
                  )}
                  {option.package_description && (
                    <div className="text-xs text-gray-500">
                      {option.package_description}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Delete this money option?")) {
                      onRemoveMoneyOption(option.id);
                    }
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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
              onClick={() => setShowItemForm(true)}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Plus className="h-3 w-3" />
              Add Item
            </button>
          </div>

          {/* Item Form */}
          {showItemForm && (
            <div className="bg-white border border-blue-300 rounded-lg p-3 mb-3">
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
                      setItemForm({ ...itemForm, item_name: e.target.value })
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
              <div
                key={option.id}
                className="bg-white rounded p-3 flex items-start justify-between"
              >
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
                      <>Flexible quantity ({option.unit})</>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Delete this item option?")) {
                      onRemoveItemOption(option.id);
                    }
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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
    </div>
  );
}
