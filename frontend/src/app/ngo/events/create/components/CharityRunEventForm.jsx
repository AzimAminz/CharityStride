// app/create-event/components/CharityRunEventForm.jsx - Update
import { Plus, Trash2 } from "lucide-react";

const CharityRunEventForm = ({
  charityRunData,
  handleRunCategoryChange,
  addRunCategory,
  removeRunCategory,
  formData,
  tshirtSettings
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Run Categories</h2>
        <button
          type="button"
          onClick={addRunCategory}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      <div className="space-y-6">
        {charityRunData.run_categories.map((category, index) => (
          <div key={category.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-semibold text-gray-900">
                Category {index + 1}
              </h3>
              {charityRunData.run_categories.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRunCategory(category.id)}
                  className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Basic Category Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={category.category_name}
                  onChange={(e) => handleRunCategoryChange(index, 'category_name', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., 5km Fun Run, 12km Competitive"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance (km) *
                  </label>
                  <input
                    type="number"
                    value={category.distance_km}
                    onChange={(e) => handleRunCategoryChange(index, 'distance_km', e.target.value)}
                    required
                    min="0"
                    step="0.1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fee (RM)
                  </label>
                  <input
                    type="number"
                    value={category.fee}
                    onChange={(e) => handleRunCategoryChange(index, 'fee', e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  value={category.capacity}
                  onChange={(e) => handleRunCategoryChange(index, 'capacity', e.target.value)}
                  required
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* T-Shirt Eligibility Section */}
            {formData.has_tshirt && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  T-Shirt Eligibility for This Category
                </h4>
                
                <div className="space-y-3">
                  {/* Event Tee Eligibility */}
                  {tshirtSettings.provide_event_tee && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600">👕</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Event Tee</div>
                          <div className="text-xs text-gray-600">For all participants in this category</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={category.includes_event_tee}
                          onChange={(e) => handleRunCategoryChange(index, 'includes_event_tee', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  )}

                  {/* Finisher Tee Eligibility */}
                  {tshirtSettings.provide_finisher_tee && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                          <span className="text-amber-600">🏆</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Finisher Tee</div>
                          <div className="text-xs text-gray-600">
                            For completing {category.distance_km}km
                          </div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={category.includes_finisher_tee}
                          onChange={(e) => handleRunCategoryChange(index, 'includes_finisher_tee', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharityRunEventForm;