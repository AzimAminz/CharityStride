// hooks/useEventForm.js
import { useState, useCallback, useEffect } from 'react';

export const useEventForm = () => {
  const [formData, setFormData] = useState({
    // Basic info
    title: "",
    type: "volunteer",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    start_date: "",
    end_date: "",
    capacity: 0,
    thumbnail: null,
    has_tshirt: false,
    status: "open",
  });

  // ✅ Tshirt settings berdasarkan event type
  const [tshirtSettings, setTshirtSettings] = useState({
    // Untuk semua event types yang ada tshirt
    provide_event_tee: false,
    provide_finisher_tee: false,
    provide_volunteer_tee: false,
  });

  // ✅ Event type specific data
  const [volunteerData, setVolunteerData] = useState({
    shifts: [
      {
        id: 1,
        shift_date: "",
        start_time: "",
        end_time: "",
        capacity: 0
      }
    ]
  });

  const [charityRunData, setCharityRunData] = useState({
    run_categories: [
      {
        id: 1,
        category_name: "",
        distance_km: 0,
        fee: 0,
        capacity: 0,
        includes_event_tee: true, // ✅ Default ada event tee
        includes_finisher_tee: false, // ✅ Default tiada finisher tee
      }
    ]
  });

  const [foodDonationData, setFoodDonationData] = useState({
    food_type: "",
    quantity: 0,
    unit: "kg",
    contact_person: "",
    contact_phone: "",
    fee: 0
  });

  const [sections, setSections] = useState([
    {
      id: 1,
      title: "",
      content: "",
      images: []
    }
  ]);

  // ✅ Handle input change
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // ✅ Reset tshirt settings when event type changes
  useEffect(() => {
    if (formData.type === 'food_donation') {
      // Food donation tak ada tshirt
      setFormData(prev => ({ ...prev, has_tshirt: false }));
      setTshirtSettings({
        provide_event_tee: false,
        provide_finisher_tee: false,
        provide_volunteer_tee: false,
      });
    } else if (formData.type === 'volunteer') {
      // Volunteer: ada volunteer tee sahaja
      setTshirtSettings({
        provide_event_tee: false,
        provide_finisher_tee: false,
        provide_volunteer_tee: true,
      });
    } else if (formData.type === 'charity_run') {
      // Charity run: ada event tee & finisher tee
      setTshirtSettings({
        provide_event_tee: true,
        provide_finisher_tee: true,
        provide_volunteer_tee: false,
      });
    }
  }, [formData.type]);

  // ✅ Handle tshirt setting change
  const handleTshirtSettingChange = useCallback((field, value) => {
    setTshirtSettings(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // ✅ Volunteer handlers
  const handleShiftChange = useCallback((shiftId, field, value) => {
    setVolunteerData(prev => ({
      ...prev,
      shifts: prev.shifts.map(shift => 
        shift.id === shiftId ? { ...shift, [field]: value } : shift
      )
    }));
  }, []);

  const addNewShift = useCallback(() => {
    const newShift = {
      id: volunteerData.shifts.length + 1,
      shift_date: "",
      start_time: "",
      end_time: "",
      capacity: 0
    };
    setVolunteerData(prev => ({
      ...prev,
      shifts: [...prev.shifts, newShift]
    }));
  }, [volunteerData.shifts.length]);

  const removeShift = useCallback((shiftId) => {
    if (volunteerData.shifts.length > 1) {
      setVolunteerData(prev => ({
        ...prev,
        shifts: prev.shifts.filter(shift => shift.id !== shiftId)
      }));
    }
  }, [volunteerData.shifts.length]);

  // ✅ Charity run handlers
  const handleRunCategoryChange = useCallback((index, field, value) => {
    const processedValue = field === 'fee' || field === 'capacity' || field === 'distance_km' 
      ? parseFloat(value) || 0 
      : value;
    
    setCharityRunData(prev => ({
      ...prev,
      run_categories: prev.run_categories.map((category, i) => 
        i === index ? { ...category, [field]: processedValue } : category
      )
    }));
  }, []);

  const addRunCategory = useCallback(() => {
    const newCategory = {
      id: charityRunData.run_categories.length + 1,
      category_name: "",
      distance_km: 0,
      fee: 0,
      capacity: 0,
      includes_event_tee: tshirtSettings.provide_event_tee,
      includes_finisher_tee: false, // Default tak ada finisher tee
    };
    setCharityRunData(prev => ({
      ...prev,
      run_categories: [...prev.run_categories, newCategory]
    }));
  }, [charityRunData.run_categories.length, tshirtSettings.provide_event_tee]);

  const removeRunCategory = useCallback((categoryId) => {
    if (charityRunData.run_categories.length > 1) {
      setCharityRunData(prev => ({
        ...prev,
        run_categories: prev.run_categories.filter(cat => cat.id !== categoryId)
      }));
    }
  }, [charityRunData.run_categories.length]);

  // ✅ Food donation handlers
  const handleFoodDonationChange = useCallback((field, value) => {
    const processedValue = field === 'fee' || field === 'quantity' 
      ? parseFloat(value) || 0 
      : value;
    
    setFoodDonationData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  }, []);

  // ✅ Section handlers
  const handleSectionChange = useCallback((sectionId, field, value) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, [field]: value }
        : section
    ));
  }, []);

  const addNewSection = useCallback(() => {
    const newSection = {
      id: sections.length + 1,
      title: "",
      content: "",
      images: []
    };
    setSections(prev => [...prev, newSection]);
  }, [sections.length]);

  const removeSection = useCallback((sectionId) => {
    if (sections.length > 1) {
      setSections(prev => prev.filter(section => section.id !== sectionId));
    }
  }, [sections.length]);

  const handleImageUpload = useCallback((sectionId, e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl: URL.createObjectURL(file)
      }));

      setSections(prev => prev.map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              images: [...section.images, ...newImages] 
            }
          : section
      ));
    }
  }, []);

  const removeImage = useCallback((sectionId, imageId) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { 
            ...section, 
            images: section.images.filter(img => img.id !== imageId) 
          }
        : section
    ));
  }, []);

  const handleCategorySizeChange = useCallback((categoryId, teeType, sizeId, quantity) => {
    // Implementasi untuk update state size per category
    // Anda boleh simpan dalam charityRunData atau state berasingan
    console.log(`Update size: Category ${categoryId}, ${teeType}, Size ${sizeId}, Qty ${quantity}`);
    
    // Contoh implementasi:
    setCharityRunData(prev => {
      const newCategories = [...prev.run_categories];
      const categoryIndex = newCategories.findIndex(cat => cat.id === categoryId);
      
      if (categoryIndex !== -1) {
        // Initialize sizes array jika belum ada
        if (!newCategories[categoryIndex].sizes) {
          newCategories[categoryIndex].sizes = {
            event_tee: [],
            finisher_tee: []
          };
        }
        
        // Update quantity untuk size tertentu
        const sizeArray = newCategories[categoryIndex].sizes[teeType];
        const sizeIndex = sizeArray.findIndex(s => s.id === sizeId);
        
        if (sizeIndex !== -1) {
          sizeArray[sizeIndex].quantity = parseInt(quantity) || 0;
        } else {
          sizeArray.push({
            id: sizeId,
            size_code: ['XS','S','M','L','XL','XXL','3XL'][sizeId-1] || 'UNKNOWN',
            quantity: parseInt(quantity) || 0
          });
        }
      }
      
      return { ...prev, run_categories: newCategories };
    });
  }, []);

  // ✅ Calculate total capacity
  const totalCapacity = formData.type === 'volunteer' 
    ? volunteerData.shifts.reduce((sum, shift) => sum + (parseInt(shift.capacity) || 0), 0)
    : formData.type === 'charity_run'
    ? charityRunData.run_categories.reduce((sum, cat) => sum + (parseInt(cat.capacity) || 0), 0)
    : formData.capacity;

  return {
    formData,
    setFormData,
    tshirtSettings,
    volunteerData,
    charityRunData,
    foodDonationData,
    sections,
    totalCapacity,
    handleInputChange,
    handleTshirtSettingChange,
    handleShiftChange,
    handleCategorySizeChange,
    addNewShift,
    removeShift,
    handleRunCategoryChange,
    addRunCategory,
    removeRunCategory,
    handleFoodDonationChange,
    handleSectionChange,
    addNewSection,
    removeSection,
    handleImageUpload,
    removeImage,
    handleThumbnailUpload: useCallback((e) => {
      const file = e.target.files[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({
          ...prev,
          thumbnail: { file, previewUrl }
        }));
      }
    }, []),
    removeThumbnail: useCallback(() => {
      setFormData(prev => ({
        ...prev,
        thumbnail: null
      }));
    }, []),
  };
};