import { useState, useCallback } from 'react';

export const useEventForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    type: "volunteer",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    start_date: "",
    end_date: "",
    capacity: 0,
    fee: 0,
    points_per_participation: 100,
    thumbnail: null,
    // Field khusus untuk food rescue
    food_type: "",
    quantity: 0,
    unit: "kg",
    collection_instructions: "",
    contact_person: "",
    contact_phone: "",
    show_location: false // Untuk toggle sama ada nak tunjuk location atau tidak
  });

  const [sections, setSections] = useState([
    {
      id: 1,
      title: "About This Event",
      content: "",
      images: []
    }
  ]);

  const [shifts, setShifts] = useState([
    {
      id: 1,
      shift_date: "",
      start_time: "",
      end_time: "",
      capacity: 0
    }
  ]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);


  const handleThumbnailUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        thumbnail: { file, previewUrl }
      }));
    }
  }, []);

  const removeThumbnail = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      thumbnail: null
    }));
  }, []);

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

  const handleShiftChange = useCallback((shiftId, field, value) => {
    setShifts(prev => prev.map(shift => 
      shift.id === shiftId 
        ? { ...shift, [field]: value }
        : shift
    ));
  }, []);

  const addNewShift = useCallback(() => {
    const newShift = {
      id: shifts.length + 1,
      shift_date: "",
      start_time: "",
      end_time: "",
      capacity: 0
    };
    setShifts(prev => [...prev, newShift]);
  }, [shifts.length]);

  const removeShift = useCallback((shiftId) => {
    if (shifts.length > 1) {
      setShifts(prev => prev.filter(shift => shift.id !== shiftId));
    }
  }, [shifts.length]);

  const totalCapacity = shifts.reduce((sum, shift) => sum + (parseInt(shift.capacity) || 0), 0);

  return {
    formData,
    setFormData,
    sections,
    shifts,
    totalCapacity,
    handleInputChange,
    handleThumbnailUpload,
    removeThumbnail,
    handleSectionChange,
    addNewSection,
    removeSection,
    handleImageUpload,
    removeImage,
    handleShiftChange,
    addNewShift,
    removeShift
  };
};