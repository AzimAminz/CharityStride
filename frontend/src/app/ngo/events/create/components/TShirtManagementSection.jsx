// src/app/ngo/events/create/components/TShirtManagementSection.jsx
import { Shirt, Trophy, Users, Package } from "lucide-react";
import { useState, useEffect } from "react";

const TShirtManagementSection = ({
  formData,
  tshirtSettings,
  charityRunData,
  handleTshirtSettingChange,
  handleRunCategoryChange
}) => {
  // Jangan tunjuk untuk food donation
  if (formData.type === 'food_donation') return null;
  if (!formData.has_tshirt) return null;

  // Initial sizes data
  const initialSizes = [
    { id: 1, code: 'XS', name: 'Extra Small', quantity: 0 },
    { id: 2, code: 'S', name: 'Small', quantity: 0 },
    { id: 3, code: 'M', name: 'Medium', quantity: 0 },
    { id: 4, code: 'L', name: 'Large', quantity: 0 },
    { id: 5, code: 'XL', name: 'Extra Large', quantity: 0 },
    { id: 6, code: 'XXL', name: 'Double Extra Large', quantity: 0 },
    { id: 7, code: '3XL', name: 'Triple Extra Large', quantity: 0 },
  ];

  // State untuk size quantities per category (charity run)
  const [categorySizes, setCategorySizes] = useState({});

  // State untuk volunteer sizes (global)
  const [volunteerSizes, setVolunteerSizes] = useState([...initialSizes]);

  // Initialize categorySizes apabila charityRunData berubah
  useEffect(() => {
    if (formData.type === 'charity_run' && charityRunData?.run_categories) {
      const initialData = {};
      charityRunData.run_categories.forEach(category => {
        // Gunakan existing data jika ada, jika tidak, initialize baru
        initialData[category.id] = categorySizes[category.id] || {
          event_tee: [...initialSizes],
          finisher_tee: [...initialSizes]
        };
      });
      
      // Hanya update jika ada perubahan
      if (Object.keys(initialData).length !== Object.keys(categorySizes).length) {
        setCategorySizes(initialData);
      }
    }
  }, [charityRunData?.run_categories, formData.type]);

  // Handle size quantity changes untuk charity run (per category)
  const handleCategorySizeChange = (categoryId, teeType, sizeId, quantity) => {
    setCategorySizes(prev => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || {
          event_tee: [...initialSizes],
          finisher_tee: [...initialSizes]
        }),
        [teeType]: (prev[categoryId]?.[teeType] || [...initialSizes]).map(size => 
          size.id === sizeId ? { ...size, quantity: parseInt(quantity) || 0 } : size
        )
      }
    }));
  };

  // Handle volunteer size quantity changes
  const handleVolunteerSizeChange = (sizeId, quantity) => {
    setVolunteerSizes(prev => prev.map(size => 
      size.id === sizeId ? { ...size, quantity: parseInt(quantity) || 0 } : size
    ));
  };

  // Calculate totals
  const calculateTotal = (sizes) => {
    if (!sizes || !Array.isArray(sizes)) return 0;
    return sizes.reduce((sum, size) => sum + (size.quantity || 0), 0);
  };

  // Helper untuk mendapatkan size data dengan selamat
  const getCategorySizeData = (categoryId, teeType) => {
    if (!categorySizes[categoryId]) {
      return [...initialSizes];
    }
    return categorySizes[categoryId][teeType] || [...initialSizes];
  };

  // Size quantity input component untuk charity run (per category)
  const CategorySizeInput = ({ category, sizes, onQuantityChange, title, total, teeType }) => {
    // Pastikan sizes adalah array yang valid
    const safeSizes = Array.isArray(sizes) ? sizes : [...initialSizes];
    
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900">
            {title} - {category.category_name || `Category ${category.id}`}
          </h4>
          <div className="text-sm text-gray-600">
            Total: <span className="font-bold text-emerald-600">{total}</span> helai
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {safeSizes.map((size) => (
            <div key={`${category.id}-${teeType}-${size.id}`} className="border border-gray-200 rounded p-2">
              <div className="text-center mb-1">
                <div className="text-md font-bold text-gray-900">{size.code}</div>
                <div className="text-xs text-gray-500">{size.name}</div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Qty
                </label>
                <input
                  type="number"
                  value={size.quantity || 0}
                  onChange={(e) => onQuantityChange(category.id, teeType, size.id, e.target.value)}
                  min="0"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-center"
                  placeholder="0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Size quantity input component untuk volunteer (global)
  const VolunteerSizeInput = ({ sizes, onQuantityChange, title, total }) => (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-medium text-gray-900">{title}</h3>
        <div className="text-sm text-gray-600">
          Total: <span className="font-bold text-emerald-600">{total}</span> helai
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sizes.map((size) => (
          <div key={`volunteer-${size.id}`} className="border border-gray-200 rounded-lg p-3">
            <div className="text-center mb-2">
              <div className="text-lg font-bold text-gray-900">{size.code}</div>
              <div className="text-xs text-gray-500">{size.name}</div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Kuantiti
              </label>
              <input
                type="number"
                value={size.quantity || 0}
                onChange={(e) => onQuantityChange(size.id, e.target.value)}
                min="0"
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-center"
                placeholder="0"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCharityRunTshirtSettings = () => {
    if (formData.type !== 'charity_run') return null;
    if (!charityRunData?.run_categories) return null;

    return (
      <div className="space-y-6">
        {/* Run Categories T-Shirt Eligibility */}
        <div className="mt-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4">
            T-Shirt Eligibility by Run Category
          </h3>
          
          {charityRunData.run_categories.map((category, index) => (
            <div key={category.id} className="border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {category.category_name || `Category ${index + 1}`}
                  </h4>
                  <p className="text-sm text-gray-600">{category.distance_km} km • Capacity: {category.capacity}</p>
                </div>
              </div>

              {/* Eligibility Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Event Tee */}
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Shirt className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-900 flex items-center justify-between">
                      <span>Event Tee</span>
                      <input
                        type="checkbox"
                        checked={category.includes_event_tee || false}
                        onChange={(e) => handleRunCategoryChange(index, 'includes_event_tee', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                      />
                    </label>
                    <p className="text-xs text-gray-600">Untuk semua peserta category ini</p>
                  </div>
                </div>

                {/* Finisher Tee */}
                <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
                  <Trophy className="w-5 h-5 text-amber-600" />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-900 flex items-center justify-between">
                      <span>Finisher Tee</span>
                      <input
                        type="checkbox"
                        checked={category.includes_finisher_tee || false}
                        onChange={(e) => handleRunCategoryChange(index, 'includes_finisher_tee', e.target.checked)}
                        className="w-4 h-4 text-amber-600 border-gray-300 rounded"
                      />
                    </label>
                    <p className="text-xs text-gray-600">Untuk peserta yang complete {category.distance_km}km</p>
                  </div>
                </div>
              </div>

              {/* Size Quantities untuk category ini */}
              {category.includes_event_tee && tshirtSettings.provide_event_tee && (
                <CategorySizeInput
                  category={category}
                  sizes={getCategorySizeData(category.id, 'event_tee')}
                  onQuantityChange={handleCategorySizeChange}
                  title="Event Tee"
                  total={calculateTotal(getCategorySizeData(category.id, 'event_tee'))}
                  teeType="event_tee"
                />
              )}

              {category.includes_finisher_tee && tshirtSettings.provide_finisher_tee && (
                <CategorySizeInput
                  category={category}
                  sizes={getCategorySizeData(category.id, 'finisher_tee')}
                  onQuantityChange={handleCategorySizeChange}
                  title="Finisher Tee"
                  total={calculateTotal(getCategorySizeData(category.id, 'finisher_tee'))}
                  teeType="finisher_tee"
                />
              )}

              {/* Summary untuk category ini */}
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Category Summary:</span>
                  <div className="space-x-4">
                    {category.includes_event_tee && (
                      <span className="text-blue-600">
                        Event Tee: {calculateTotal(getCategorySizeData(category.id, 'event_tee'))}
                      </span>
                    )}
                    {category.includes_finisher_tee && (
                      <span className="text-amber-600">
                        Finisher Tee: {calculateTotal(getCategorySizeData(category.id, 'finisher_tee'))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Total Summary untuk semua categories */}
          <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h4 className="text-sm font-medium text-emerald-900 mb-2">Total Semua Categories</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tshirtSettings.provide_event_tee && (
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-lg font-bold text-blue-600">
                    {charityRunData.run_categories.reduce((total, category) => {
                      if (category.includes_event_tee) {
                        return total + calculateTotal(getCategorySizeData(category.id, 'event_tee'));
                      }
                      return total;
                    }, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Event Tee</div>
                </div>
              )}
              
              {tshirtSettings.provide_finisher_tee && (
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-lg font-bold text-amber-600">
                    {charityRunData.run_categories.reduce((total, category) => {
                      if (category.includes_finisher_tee) {
                        return total + calculateTotal(getCategorySizeData(category.id, 'finisher_tee'));
                      }
                      return total;
                    }, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Finisher Tee</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVolunteerTshirtSettings = () => {
    if (formData.type !== 'volunteer') return null;

    return (
      <div className="space-y-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">Volunteer T-Shirt</p>
              <p className="text-sm text-green-700">
                All registered volunteers will receive a volunteer t-shirt.
              </p>
            </div>
          </div>
        </div>

        {/* Size Quantities untuk Volunteer (global) */}
        {tshirtSettings.provide_volunteer_tee && (
          <VolunteerSizeInput
            sizes={volunteerSizes}
            onQuantityChange={handleVolunteerSizeChange}
            title="Volunteer Tee - Saiz & Kuantiti"
            total={calculateTotal(volunteerSizes)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <Shirt className="w-5 h-5 mr-2 text-blue-600" />
        Pengurusan T-Shirt
      </h2>

      {/* T-Shirt Options for Event Type */}
      <div className="space-y-4">
        {formData.type === 'charity_run' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shirt className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Event Tee</div>
                  <div className="text-xs text-gray-600">Untuk semua peserta run (set per category)</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tshirtSettings.provide_event_tee || false}
                  onChange={(e) => handleTshirtSettingChange('provide_event_tee', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Trophy className="w-5 h-5 text-amber-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Finisher Tee</div>
                  <div className="text-xs text-gray-600">Untuk peserta yang complete run (set per category)</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tshirtSettings.provide_finisher_tee || false}
                  onChange={(e) => handleTshirtSettingChange('provide_finisher_tee', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </div>
        )}

        {formData.type === 'volunteer' && (
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">Volunteer Tee</div>
                <div className="text-xs text-gray-600">Untuk semua volunteer (global)</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={tshirtSettings.provide_volunteer_tee || false}
                onChange={(e) => handleTshirtSettingChange('provide_volunteer_tee', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        )}
      </div>

      {/* Category-specific settings */}
      {renderCharityRunTshirtSettings()}
      {renderVolunteerTshirtSettings()}

      {/* Information Note */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <Package className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">Nota Pengurusan Saiz</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Charity Run:</strong> Set kuantiti untuk setiap category run</li>
              <li>• <strong>Volunteer:</strong> Set kuantiti global untuk semua volunteer</li>
              <li>• Peserta akan pilih saiz semasa pendaftaran</li>
              <li>• Pastikan jumlah cukup untuk semua peserta</li>
              <li>• Setiap category boleh ada eligibility berbeza untuk Event/Finisher tee</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TShirtManagementSection;