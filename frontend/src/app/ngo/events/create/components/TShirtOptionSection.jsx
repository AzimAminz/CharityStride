// app/create-event/components/TShirtOptionSection.jsx
const TShirtOptionSection = ({ formData, handleInputChange }) => {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">T-Shirt</h2>
            <p className="text-sm text-gray-600">
              Adakah event ini menyediakan t-shirt untuk peserta?
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="has_tshirt"
              checked={formData.has_tshirt}
              onChange={handleInputChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900">
              {formData.has_tshirt ? 'Ya' : 'Tidak'}
            </span>
          </label>
        </div>
      </div>
    );
  };
  
  export default TShirtOptionSection;