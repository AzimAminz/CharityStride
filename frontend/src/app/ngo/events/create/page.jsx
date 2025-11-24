// app/create-event/page.jsx
"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Save, Eye, Plus, Trash2, Image as ImageIcon, MapPin, Navigation, Package, User, Phone, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEventForm } from "./hooks/useEventForm";
import { useMap } from "./hooks/useMap";
import EventPreview from "./components/EventPreview";

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
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
  } = useEventForm();

  const {
    mapRef,
    mapSearch,
    isSearching,
    isGettingLocation,
    locationError,
    handleGetCurrentLocation,
    handleManualSearch,
    handleMapSearchChange
  } = useMap(formData, setFormData);

  const handlePreview = useCallback(() => {
    setShowPreview(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setShowPreview(false);
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

          {/* Food Rescue Specific Fields */}
          {formData.type === 'food_rescue' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-orange-600" />
                Food Rescue Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type of Food *
                  </label>
                  <input
                    type="text"
                    name="food_type"
                    value={formData.food_type}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit *
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="portion">Portions</option>
                      <option value="box">Boxes</option>
                      <option value="packet">Packets</option>
                      <option value="unit">Units</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Instructions *
                  </label>
                  <textarea
                    name="collection_instructions"
                    value={formData.collection_instructions}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Detailed instructions for food collection..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Name of contact person"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Phone number for collection"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Location Privacy</p>
                      <p className="text-sm text-blue-700">
                        For security reasons, the exact location will only be shared with approved volunteers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Location & Date Section - Tunjukkan untuk semua jenis event kecuali food rescue */}
          {(formData.type !== 'food_rescue') && (
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
                    <div className="relative">
                      <input
                        id="map-search"
                        type="text"
                        value={mapSearch}
                        onChange={handleMapSearchChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-32"
                        placeholder="Search for location..."
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        {isSearching && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                        )}
                        <button
                          type="button"
                          onClick={handleManualSearch}
                          className="px-3 py-1 text-sm bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                        >
                          Search
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {isSearching ? "Searching..." : "Type to search or click on the map to set pin"}
                    </p>
                  </div>

                  {/* Current Location Button */}
                  <div>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={isGettingLocation}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isGettingLocation ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500 mr-2"></div>
                          Getting Location...
                        </>
                      ) : (
                        <>
                          <Navigation className="w-4 h-4 mr-2" />
                          Use My Current Location
                        </>
                      )}
                    </button>
                    
                    {locationError && (
                      <p className="text-sm text-red-600 mt-2">{locationError}</p>
                    )}
                    
                    {formData.latitude && formData.longitude && (
                      <p className="text-sm text-gray-600 mt-2">
                        Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                      </p>
                    )}
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

                  {/* Toggle untuk show location */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="show_location"
                      checked={formData.show_location}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Show location publicly on event page
                    </label>
                  </div>
                </div>

                {/* Map Container */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Set Location on Map
                  </label>
                  <div 
                    ref={mapRef}
                    className="w-full h-80 rounded-lg border border-gray-300 bg-gray-100 flex items-center justify-center"
                  >
                    {isGettingLocation ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Getting your location...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Loading map...</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Drag the pin to adjust location or click "Use My Current Location"
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Untuk food rescue, tunjuk date fields sahaja */}
          {formData.type === 'food_rescue' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Collection Date</h2>
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Shifts Management - untuk volunteer events sahaja */}
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
      <EventPreview
        showPreview={showPreview}
        handleClosePreview={handleClosePreview}
        formData={formData}
        sections={sections}
        shifts={shifts}
        totalCapacity={totalCapacity}
      />
    </div>
  );
}