// app/create-event/components/FoodDonationDateSection.jsx
const FoodDonationDateSection = ({ formData, handleInputChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Collection Date & Capacity</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Collection Date *
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
            Capacity (Max Volunteers) *
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
        </div>
      </div>
    </div>
  );
};

export default FoodDonationDateSection;