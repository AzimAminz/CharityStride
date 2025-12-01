// app/create-event/page.jsx
"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Hooks
import { useEventForm } from "./hooks/useEventForm";
import { useMap } from "./hooks/useMap";

// Components - PERBAIKI IMPORT INI
import BasicInformationSection from "./components/BasicInformationSection";
import TShirtOptionSection from "./components/TShirtOptionSection";
import TShirtManagementSection from "./components/TShirtManagementSection";
import VolunteerEventForm from "./components/VolunteerEventForm";
import CharityRunEventForm from "./components/CharityRunEventForm";
import FoodDonationEventForm from "./components/FoodDonationEventForm";
import EventSections from "./components/EventSections";
import LocationDateSection from "./components/LocationDateSection"; // ✅ BETUL
import FoodDonationDateSection from "./components/FoodDonationDateSection";

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Hooks
  const {
    formData,
    setFormData,
    tshirtSettings,
    tshirtSizes,
    volunteerData,
    charityRunData,
    foodDonationData,
    sections,
    totalCapacity,
    totalTshirtQuantity,
    handleInputChange,
    handleTshirtSettingChange,
    updateTshirtSizeQuantity,
    handleThumbnailUpload,
    removeThumbnail,
    handleShiftChange,
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
    removeImage
  } = useEventForm();

  const {
    mapRef,
    mapSearch,
    isSearching,
    isGettingLocation,
    locationError,
    coordinates,
    handleGetCurrentLocation,
    handleManualSearch,
    handleMapSearchChange
  } = useMap();

  // Sync coordinates from map to formData
  useEffect(() => {
    if (coordinates.latitude && coordinates.longitude) {
      setFormData(prev => ({
        ...prev,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        location: coordinates.location || prev.location
      }));
    }
  }, [coordinates, setFormData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Prepare data berdasarkan event type
      const eventData = {
        // Basic info
        ...formData,
        capacity: totalCapacity,
        tshirt_settings: tshirtSettings,
        tshirt_sizes: tshirtSizes,
        
        // Type-specific data
        ...(formData.type === 'volunteer' && {
          shifts: volunteerData.shifts
        }),
        ...(formData.type === 'charity_run' && {
          run_categories: charityRunData.run_categories
        }),
        ...(formData.type === 'food_donation' && {
          food_donation: foodDonationData
        }),
        
        // Common sections
        sections: sections.map(section => ({
          title: section.title,
          content: section.content,
          images: section.images.map(img => ({
            image_url: img.previewUrl
          }))
        }))
      };

      console.log("Submitting event data:", eventData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push("/ngo");
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setLoading(false);
    }
  };

  // Render event type specific form
  const renderEventTypeForm = () => {
    switch (formData.type) {
      case 'volunteer':
        return (
          <VolunteerEventForm
            volunteerData={volunteerData}
            handleShiftChange={handleShiftChange}
            addNewShift={addNewShift}
            removeShift={removeShift}
            totalCapacity={totalCapacity}
            formData={formData} // ✅ TAMBAH PROPS INI
          />
        );
      case 'charity_run':
        return (
          <CharityRunEventForm
            charityRunData={charityRunData}
            handleRunCategoryChange={handleRunCategoryChange}
            addRunCategory={addRunCategory}
            removeRunCategory={removeRunCategory}
            formData={formData} // ✅ TAMBAH PROPS INI
            tshirtSettings={tshirtSettings} // ✅ TAMBAH PROPS INI
          />
        );
      case 'food_donation':
        return (
          <>
            <FoodDonationEventForm
              foodDonationData={foodDonationData}
              handleFoodDonationChange={handleFoodDonationChange}
            />
            <FoodDonationDateSection
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </>
        );
      default:
        return null;
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
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
              <p className="text-gray-600">
                Fill in the details to create your {formData.type.replace('_', ' ')} event
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="event-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <BasicInformationSection
            formData={formData}
            handleInputChange={handleInputChange}
            handleThumbnailUpload={handleThumbnailUpload}
            removeThumbnail={removeThumbnail}
          />

          {/* T-Shirt Options (kecuali food donation) */}
          {formData.type !== 'food_donation' && (
            <TShirtOptionSection
              formData={formData}
              handleInputChange={handleInputChange}
            />
          )}

          {/* T-Shirt Management (jika enabled) */}
          {formData.has_tshirt && formData.type !== 'food_donation' && (
            <TShirtManagementSection
              formData={formData}
              tshirtSettings={tshirtSettings}
              charityRunData={charityRunData} // ✅ TAMBAH PROPS INI
              handleTshirtSettingChange={handleTshirtSettingChange}
              handleRunCategoryChange={handleRunCategoryChange} // ✅ TAMBAH PROPS INI
            />
          )}

          {/* Event Type Specific Form */}
          {renderEventTypeForm()}

          {/* Location & Date (kecuali food donation) */}
          {formData.type !== 'food_donation' && (
            <LocationDateSection
              formData={formData}
              mapSearch={mapSearch}
              isSearching={isSearching}
              isGettingLocation={isGettingLocation}
              locationError={locationError}
              mapRef={mapRef}
              handleInputChange={handleInputChange}
              handleMapSearchChange={handleMapSearchChange}
              handleManualSearch={handleManualSearch}
              handleGetCurrentLocation={handleGetCurrentLocation}
              eventType={formData.type}
            />
          )}

          {/* Event Sections */}
          <EventSections
            sections={sections}
            handleSectionChange={handleSectionChange}
            addNewSection={addNewSection}
            removeSection={removeSection}
            handleImageUpload={handleImageUpload}
            removeImage={removeImage}
          />

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky bottom-4">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Review all information before creating your event
              </div>
              
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
        </form>
      </div>
    </div>
  );
}