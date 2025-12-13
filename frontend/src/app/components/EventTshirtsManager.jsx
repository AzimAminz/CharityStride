"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Shirt } from "lucide-react";

/**
 * Event T-shirts Manager
 * Manages t-shirt inventory by size
 */
export default function EventTshirtsManager({
  eventId,
  tshirts = [],
  sizes = [],
  runCategories = [],
  eventType,
  onUpdate,
}) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    run_category_id: "",
    tshirt_type: eventType === "volunteer" ? "volunteer" : "event",
    size_id: "",
    size_code: "",
    quantity_total: "",
  });
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!formData.size_id || !formData.quantity_total) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/ngo/events/${eventId}/tshirts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantity_total: parseInt(formData.quantity_total),
        }),
      });

      if (!response.ok) throw new Error("Failed to add t-shirt");

      resetForm();
      onUpdate?.();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tshirtId) => {
    if (!confirm("Are you sure you want to delete this t-shirt?")) return;

    try {
      const response = await fetch(
        `/api/ngo/events/${eventId}/tshirts/${tshirtId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete t-shirt");

      onUpdate?.();
    } catch (error) {
      alert(error.message);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setAdding(false);
    setFormData({
      run_category_id: "",
      tshirt_type: eventType === "volunteer" ? "volunteer" : "event",
      size_id: "",
      size_code: "",
      quantity_total: "",
    });
  };

  const handleSizeChange = (e) => {
    const sizeId = e.target.value;
    const size = sizes.find((s) => s.id === parseInt(sizeId));
    setFormData({
      ...formData,
      size_id: sizeId,
      size_code: size?.code || "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          T-shirt Inventory
        </h3>
        {!adding && !editing && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add T-shirt
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(adding || editing) && (
        <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-300">
          <h4 className="font-medium text-gray-900 mb-3">
            {editing ? "Edit T-shirt" : "New T-shirt"}
          </h4>
          <div className="space-y-3">
            {eventType === "charity_run" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.run_category_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        run_category_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {runCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    T-shirt Type
                  </label>
                  <select
                    value={formData.tshirt_type}
                    onChange={(e) =>
                      setFormData({ ...formData, tshirt_type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="event">Event Tee</option>
                    <option value="finisher">Finisher Tee</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size
              </label>
              <select
                value={formData.size_id}
                onChange={handleSizeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select size</option>
                {sizes.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.quantity_total}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, quantity_total: value });
                }}
                placeholder="Total quantity"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* T-shirts List */}
      <div className="space-y-3">
        {tshirts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Shirt className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600">
              No t-shirts yet. Add t-shirt inventory!
            </p>
          </div>
        ) : (
          tshirts.map((tshirt) => (
            <div
              key={tshirt.id}
              className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Shirt className="h-4 w-4 text-purple-600" />
                    <span className="font-semibold text-gray-900">
                      Size {tshirt.size_code}
                    </span>
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                      {tshirt.tshirt_type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Total: {tshirt.quantity_total}</div>
                    <div>Available: {tshirt.quantity_available}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(tshirt.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
