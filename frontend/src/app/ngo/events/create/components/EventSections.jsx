// components/EventSections.jsx
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";

const EventSections = ({
  sections,
  handleSectionChange,
  addNewSection,
  removeSection,
  handleImageUpload,
  removeImage
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Event Details & Images</h2>
        <button
          type="button"
          onClick={addNewSection}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </button>
      </div>

      <div className="space-y-8">
        {sections.map((section, index) => (
          <div key={section.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-semibold text-gray-900">
                Section {index + 1}
              </h3>
              {sections.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSection(section.id)}
                  className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Title *
                </label>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                  placeholder="e.g., About This Event, What to Bring, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Content *
                </label>
                <textarea
                  value={section.content}
                  onChange={(e) => handleSectionChange(section.id, 'content', e.target.value)}
                  required
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                  placeholder="Detailed content for this section..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Images
                </label>
                
                {/* Image Upload Button */}
                <div className="mb-4">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload images</p>
                      <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(section.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preview Uploaded Images */}
                {section.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {section.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.previewUrl}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(section.id, image.id)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {sections.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No sections added yet</p>
          <button
            type="button"
            onClick={addNewSection}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Section
          </button>
        </div>
      )}
    </div>
  );
};

export default EventSections;