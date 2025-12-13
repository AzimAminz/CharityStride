"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon } from "lucide-react";
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

  const handleAdd = async () => {
    if (!formData.title || !formData.content) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await addEventSection(eventId, formData);
      setFormData({ title: "", content: "" });
      setAdding(false);
      onUpdate?.();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add section");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (sectionId) => {
    if (!formData.title || !formData.content) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await updateEventSection(eventId, sectionId, formData);
      setFormData({ title: "", content: "" });
      setEditing(null);
      onUpdate?.();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update section");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sectionId) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      await deleteEventSection(eventId, sectionId);
      onUpdate?.();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete section");
    }
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
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Section Title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />

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

            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="Section Content"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
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
    </div>
  );
}
