"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Save, Eye, Plus, Trash2, Image as ImageIcon, MapPin, Clock, Calendar, Users, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const router = useRouter();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    type: "volunteer",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    start_date: "",
    end_date: "",
    capacity: 50,
    fee: 0,
    points_per_participation: 100,
    thumbnail: null
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
  
  const [loading, setLoading] = useState(false);
  const [mapSearch, setMapSearch] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Initialize map
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      initMap();
    } else {
      loadGoogleMapsScript();
    }
  }, []);

  const loadGoogleMapsScript = () => {
    if (!document.querySelector('#google-maps-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  };

  const initMap = () => {
    if (!mapRef.current) return;

    const defaultLocation = { lat: 3.1390, lng: 101.6869 };
    
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 12,
    });

    const markerInstance = new window.google.maps.Marker({
      position: defaultLocation,
      map: mapInstance,
      draggable: true,
      title: "Event Location"
    });

    markerInstance.addListener('dragend', (event) => {
      const position = event.latLng;
      setFormData(prev => ({
        ...prev,
        latitude: position.lat(),
        longitude: position.lng()
      }));
      reverseGeocode(position.lat(), position.lng());
    });

    mapInstance.addListener('click', (event) => {
      markerInstance.setPosition(event.latLng);
      setFormData(prev => ({
        ...prev,
        latitude: event.latLng.lat(),
        longitude: event.latLng.lng()
      }));
      reverseGeocode(event.latLng.lat(), event.latLng.lng());
    });

    const searchBox = new window.google.maps.places.SearchBox(
      document.getElementById('map-search')
    );

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;

      const place = places[0];
      const location = place.geometry.location;

      markerInstance.setPosition(location);
      mapInstance.setCenter(location);
      mapInstance.setZoom(15);

      setFormData(prev => ({
        ...prev,
        location: place.formatted_address,
        latitude: location.lat(),
        longitude: location.lng()
      }));
    });

    setMap(mapInstance);
    setMarker(markerInstance);
  };

  const reverseGeocode = (lat, lng) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setFormData(prev => ({
          ...prev,
          location: results[0].formatted_address
        }));
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        thumbnail: { file, previewUrl }
      }));
    }
  };

  const removeThumbnail = () => {
    setFormData(prev => ({
      ...prev,
      thumbnail: null
    }));
  };

  const handleSectionChange = (sectionId, field, value) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, [field]: value }
        : section
    ));
  };

  const addNewSection = () => {
    const newSection = {
      id: sections.length + 1,
      title: "",
      content: "",
      images: []
    };
    setSections(prev => [...prev, newSection]);
  };

  const removeSection = (sectionId) => {
    if (sections.length > 1) {
      setSections(prev => prev.filter(section => section.id !== sectionId));
    }
  };

  const handleImageUpload = (sectionId, e) => {
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
  };

  const removeImage = (sectionId, imageId) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { 
            ...section, 
            images: section.images.filter(img => img.id !== imageId) 
          }
        : section
    ));
  };

  const handleShiftChange = (shiftId, field, value) => {
    setShifts(prev => prev.map(shift => 
      shift.id === shiftId 
        ? { ...shift, [field]: value }
        : shift
    ));
  };

  const addNewShift = () => {
    const newShift = {
      id: shifts.length + 1,
      shift_date: "",
      start_time: "",
      end_time: "",
      capacity: 0
    };
    setShifts(prev => [...prev, newShift]);
  };

  const removeShift = (shiftId) => {
    if (shifts.length > 1) {
      setShifts(prev => prev.filter(shift => shift.id !== shiftId));
    }
  };

  const totalCapacity = shifts.reduce((sum, shift) => sum + (parseInt(shift.capacity) || 0), 0);

  // Preview functionality
  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const eventData = {
        ...formData,
        capacity: totalCapacity > 0 ? totalCapacity : formData.capacity,
        shifts: formData.type === 'volunteer' ? shifts : [],
        sections: sections.map(section => ({
          title: section.title,
          content: section.content,
          images: section.images.map(img => ({
            image_url: img.previewUrl
          }))
        }))
      };

      console.log("Submitting event data:", eventData);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push("/ngo");
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setLoading(false);
    }
  };

  // Preview Component
  const EventPreview = () => {
    if (!showPreview) return null;

    const getEventTypeColor = (type) => {
      switch (type) {
        case 'volunteer': return 'bg-green-100 text-green-800';
        case 'food_rescue': return 'bg-orange-100 text-orange-800';
        case 'charity_run': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getEventTypeLabel = (type) => {
      switch (type) {
        case 'volunteer': return '🤝 Volunteer';
        case 'food_rescue': return '🍴 Food Rescue';
        case 'charity_run': return '🏃 Charity Run';
        default: return 'Event';
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Event Preview</h2>
              <button
                onClick={handleClosePreview}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Event Header Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(formData.type)}`}>
                      {getEventTypeLabel(formData.type)}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Open
                    </span>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {formData.title || "Event Title Preview"}
                  </h1>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">
                    {formData.fee > 0 ? `RM ${formData.fee}` : 'FREE'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formData.points_per_participation} points
                  </div>
                </div>
              </div>

              {/* Event Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-200">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium text-sm">Date</div>
                    <div className="text-gray-900">
                      {formData.start_date ? new Date(formData.start_date).toLocaleDateString('en-MY', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : "Not set"}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium text-sm">Location</div>
                    <div className="text-gray-900">{formData.location || "Not set"}</div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium text-sm">Participants</div>
                    <div className="text-gray-900">
                      0 / {totalCapacity > 0 ? totalCapacity : formData.capacity}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Star className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium text-sm">Rating</div>
                    <div className="text-gray-900">
                      New Event
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Preview */}
            {formData.thumbnail && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Thumbnail</h3>
                <img
                  src={formData.thumbnail.previewUrl}
                  alt="Event thumbnail"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Description Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {formData.description || "No description provided"}
              </p>
            </div>

            {/* Sections Preview */}
            {sections.map((section, index) => (
              <div key={section.id} className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {section.title || `Section ${index + 1}`}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {section.content || "No content provided"}
                </p>
                {section.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {section.images.map((image, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={image.previewUrl}
                        alt={`Section ${index + 1} image ${imgIndex + 1}`}
                        className="rounded-lg w-full h-48 object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Shifts Preview */}
            {formData.type === 'volunteer' && shifts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Shifts</h3>
                <div className="space-y-4">
                  {shifts.map((shift, index) => (
                    <div key={shift.id} className="p-4 border-2 border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm text-gray-500">Date</div>
                            <div className="font-semibold text-gray-900">
                              {shift.shift_date ? new Date(shift.shift_date).toLocaleDateString('en-MY') : "Not set"}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm text-gray-500">Time</div>
                            <div className="font-semibold text-gray-900">
                              {shift.start_time || "00:00"} - {shift.end_time || "00:00"}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm text-gray-500">Capacity</div>
                            <div className="font-semibold text-gray-900">
                              {shift.capacity || 0} participants
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={handleClosePreview}
                className="px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Simplified without action buttons */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/ngo"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
              <p className="text-gray-600">Fill in the details to create your event</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="event-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="volunteer">Volunteer Event</option>
                  <option value="food_rescue">Food Rescue</option>
                  <option value="charity_run">Charity Run</option>
                </select>
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Brief description of your event..."
                />
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Thumbnail *
                </label>
                <div className="space-y-4">
                  {formData.thumbnail ? (
                    <div className="relative inline-block">
                      <img
                        src={formData.thumbnail.previewUrl}
                        alt="Thumbnail preview"
                        className="w-64 h-48 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={removeThumbnail}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-64 h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Upload thumbnail</p>
                        <p className="text-xs text-gray-400">Recommended: 800x600px</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                        required
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Location & Date Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location & Date</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Event venue address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Location on Map
                  </label>
                  <input
                    id="map-search"
                    type="text"
                    value={mapSearch}
                    onChange={(e) => setMapSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Search for location..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Search for location or click on the map to set pin
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {formData.type !== 'volunteer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity *
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Map Container */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set Location on Map
                </label>
                <div 
                  ref={mapRef}
                  className="w-full h-80 rounded-lg border border-gray-300"
                />
                <div className="mt-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Drag the pin to adjust location
                </div>
              </div>
            </div>
          </div>

          {/* Shifts Management */}
          {formData.type === 'volunteer' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Event Shifts</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Total Capacity: <span className="font-semibold">{totalCapacity}</span> participants
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addNewShift}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Shift
                </button>
              </div>

              <div className="space-y-4">
                {shifts.map((shift, index) => (
                  <div key={shift.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-semibold text-gray-900">
                        Shift {index + 1}
                      </h3>
                      {shifts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeShift(shift.id)}
                          className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date *
                        </label>
                        <input
                          type="date"
                          value={shift.shift_date}
                          onChange={(e) => handleShiftChange(shift.id, 'shift_date', e.target.value)}
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time *
                        </label>
                        <input
                          type="time"
                          value={shift.start_time}
                          onChange={(e) => handleShiftChange(shift.id, 'start_time', e.target.value)}
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Time *
                        </label>
                        <input
                          type="time"
                          value={shift.end_time}
                          onChange={(e) => handleShiftChange(shift.id, 'end_time', e.target.value)}
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Capacity *
                        </label>
                        <input
                          type="number"
                          value={shift.capacity}
                          onChange={(e) => handleShiftChange(shift.id, 'capacity', e.target.value)}
                          required
                          min="1"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Event Sections & Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                                className="w-full h-32 object-cover rounded-lg"
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

          {/* Pricing & Points */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Rewards</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participation Fee (RM)
                </label>
                <input
                  type="number"
                  name="fee"
                  value={formData.fee}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Set to 0 for free events
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points Reward *
                </label>
                <input
                  type="number"
                  name="points_per_participation"
                  value={formData.points_per_participation}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Points participants will earn
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm p-6 sticky bottom-4 border-t">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Review all information before creating your event
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Preview Event
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 transition-colors"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {loading ? "Creating Event..." : "Create Event"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      <EventPreview />
    </div>
  );
}