// app/create-event/components/BasicInformationSection.jsx
import { ImageIcon, Trash2 } from "lucide-react";

const BasicInformationSection = ({
  formData,
  handleInputChange,
  handleThumbnailUpload,
  removeThumbnail
}) => {
  // Helper function untuk get event type display name
  const getEventTypeDisplay = (type) => {
    switch(type) {
      case 'volunteer': return '🤝 Volunteer Event';
      case 'charity_run': return '🏃 Charity Run';
      case 'food_donation': return '🍴 Food Donation';
      default: return 'Event';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
      
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            placeholder="Enter event title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
          >
            <option value="volunteer">🤝 Volunteer Event</option>
            <option value="charity_run">🏃 Charity Run</option>
            <option value="food_donation">🍴 Food Donation</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Currently selected: {getEventTypeDisplay(formData.type)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            placeholder="Brief description of your event..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {formData.type !== 'volunteer' && formData.type !== 'charity_run' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Capacity *
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum number of participants for this event
            </p>
          </div>
        )}

        {/* Thumbnail Upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Thumbnail *
          </label>
          <div className="space-y-4">
            {formData.thumbnail ? (
              <div className="relative inline-block">
                <img
                  src={formData.thumbnail.previewUrl}
                  alt="Thumbnail preview"
                  className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                  title="Remove thumbnail"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="mt-2 text-sm text-gray-500">
                  Thumbnail preview - Recommended size: 800x600px
                </div>
              </div>
            ) : (
              <>
                <label className="flex flex-col items-center justify-center w-full max-w-md h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-12 h-12 mb-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-600 mb-2">Click to upload thumbnail</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    <p className="text-xs text-gray-400 mt-1">Recommended: 800x600px</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                    required
                  />
                </label>
                <div className="text-sm text-gray-500">
                  Thumbnail will be displayed on event listing page
                </div>
              </>
            )}
          </div>
        </div>

        {/* Note berdasarkan event type */}
        <div className="md:col-span-2">
          <div className={`p-4 rounded-lg border ${
            formData.type === 'volunteer' 
              ? 'bg-blue-50 border-blue-200'
              : formData.type === 'charity_run'
              ? 'bg-amber-50 border-amber-200'
              : 'bg-emerald-50 border-emerald-200'
          }`}>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {formData.type === 'volunteer' && 'Volunteer Event Information'}
              {formData.type === 'charity_run' && 'Charity Run Information'}
              {formData.type === 'food_donation' && 'Food Donation Information'}
            </p>
            <p className="text-sm text-gray-700">
              {formData.type === 'volunteer' && 
                'Add shift details in the Volunteer section below. Capacity will be calculated from shifts.'}
              {formData.type === 'charity_run' && 
                'Add run categories in the Charity Run section below. Each category has its own capacity and fee.'}
              {formData.type === 'food_donation' && 
                'Add food donation details in the Food Donation section below. Include food type and quantity.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInformationSection;