// components/FoodDonationEventForm.jsx
import { Package, User, Phone, DollarSign } from "lucide-react";

const FoodDonationEventForm = ({ foodDonationData, handleFoodDonationChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Package className="w-5 h-5 mr-2 text-orange-600" />
        Food Donation Details
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type of Food *
          </label>
          <input
            type="text"
            value={foodDonationData.food_type}
            onChange={(e) => handleFoodDonationChange('food_type', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            placeholder="e.g., Fresh vegetables, Cooked meals, Bakery items"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              value={foodDonationData.quantity}
              onChange={(e) => handleFoodDonationChange('quantity', e.target.value)}
              required
              min="1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit *
            </label>
            <select
              value={foodDonationData.unit}
              onChange={(e) => handleFoodDonationChange('unit', e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="portion">Portions</option>
              <option value="box">Boxes</option>
              <option value="packet">Packets</option>
              <option value="unit">Units</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Contact Person *
          </label>
          <input
            type="text"
            value={foodDonationData.contact_person}
            onChange={(e) => handleFoodDonationChange('contact_person', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            placeholder="Name of contact person"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            Contact Phone *
          </label>
          <input
            type="tel"
            value={foodDonationData.contact_phone}
            onChange={(e) => handleFoodDonationChange('contact_phone', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            placeholder="Phone number for collection"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Donation Fee (RM)
          </label>
          <input
            type="number"
            value={foodDonationData.fee}
            onChange={(e) => handleFoodDonationChange('fee', e.target.value)}
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
          />
          <p className="text-sm text-gray-500 mt-1">
            Set to 0 for free food donation
          </p>
        </div>
      </div>
    </div>
  );
};

export default FoodDonationEventForm;