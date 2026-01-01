"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Globe,
  Calendar,
  FileText,
  Users,
  HandHeart,
  DollarSign,
  Eye,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEventForm } from "../../../hooks/useEventForm";
import { useVolunteerModule } from "../../../hooks/useVolunteerModule";
import { useDonationModule } from "../../../hooks/useDonationModule";
import { useParticipantModule } from "../../../hooks/useParticipantModule";
import { publishEvent } from "../../../lib/events";
import EventThumbnailUpload from "../../../components/EventThumbnailUpload";
import ModuleToggle from "../../../components/event-modules/ModuleToggle";
import VolunteerRoleManager from "../../../components/event-modules/VolunteerRoleManager";
import DonationConfigManager from "../../../components/event-modules/DonationConfigManager";
import ParticipantCategoryManager from "../../../components/event-modules/ParticipantCategoryManager";
import EventSectionsManager from "../../../components/EventSectionsManager";
import LanguageToggle from "../../../components/shared/LanguageToggle";
import { DateInput } from "../../../components/inputs";
import { useLanguage } from "../../../contexts/LanguageContext";
import { HelpTooltip, ProgressIndicator } from "../../../components/help";
import { translations } from "../../../lib/translations";
import AlertModal from "../../../components/AlertModal";
import ConfirmModal from "../../../components/ConfirmModal";
import SavedLocationPicker from "../../../components/SavedLocationPicker";

export default function CreateEventPage() {
  const router = useRouter();
  const { formData, handleChange, handleSubmit, loading, error } =
    useEventForm();
  const { language } = useLanguage();

  const [createdEventId, setCreatedEventId] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [eventSections, setEventSections] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  // Modal states
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [showLocationForm, setShowLocationForm] = useState(false);

  // Volunteer Module hooks (only initialized after event created)
  const volunteerModule = useVolunteerModule(createdEventId);
  const donationModule = useDonationModule(createdEventId);
  const participantModule = useParticipantModule(createdEventId);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Helper function to validate and navigate
  const handleTabNavigation = (tabId) => {
    // List of config tabs that require validation
    const configTabs = [
      "volunteer_config",
      "donation_config",
      "participant_config",
      "content",
    ];

    // Validate basic info when leaving basic tab to ANY other tab
    if (activeTab === "basic" && tabId !== "basic") {
      const errors = [];
      if (!formData.title?.trim()) errors.push("Event title");
      if (!formData.description?.trim()) errors.push("Event description");
      if (!formData.start_date) errors.push("Start date");
      if (!formData.end_date) errors.push("End date");

      // Location only required if going to CONFIG tabs AND (volunteer or participant enabled)
      if (configTabs.includes(tabId)) {
        const needsLocation =
          formData.has_volunteer || formData.has_participant;
        if (needsLocation) {
          if (!formData.location) errors.push("Event location (address)");
          if (!formData.latitude || !formData.longitude)
            errors.push("Map location (click on map to set)");
        }
      }

      if (errors.length > 0) {
        setAlertModal({
          isOpen: true,
          title: "Please Complete Basic Information",
          message:
            "The following fields are required:\n\n" +
            errors.map((e) => `• ${e}`).join("\n"),
          type: "error",
          onClose: () => setAlertModal((prev) => ({ ...prev, isOpen: false })),
        });
        setDropdownOpen(false);
        return false;
      }
    }

    // Validate location when leaving module_selection to config tabs
    // Only if volunteer or participant modules are enabled
    if (activeTab === "module_selection" && configTabs.includes(tabId)) {
      const needsLocation = formData.has_volunteer || formData.has_participant;

      if (
        needsLocation &&
        (!formData.location || !formData.latitude || !formData.longitude)
      ) {
        setAlertModal({
          isOpen: true,
          title: "Location Required",
          message:
            "Event location with map coordinates is required for volunteer and participant modules. Please add it in the Basic Information tab.",
          type: "error",
          onClose: () => setAlertModal((prev) => ({ ...prev, isOpen: false })),
        });
        setDropdownOpen(false);
        setActiveTab("basic");
        return false;
      }
    }

    setActiveTab(tabId);
    setDropdownOpen(false);
    return true;
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();

    // Custom validation
    const errors = {};
    if (!formData.title?.trim()) {
      errors.title =
        language === "ms" ? "Tajuk diperlukan" : "Title is required";
    }
    if (!formData.description?.trim()) {
      errors.description =
        language === "ms" ? "Penerangan diperlukan" : "Description is required";
    }
    if (!formData.start_date) {
      errors.start_date =
        language === "ms" ? "Tarikh mula diperlukan" : "Start date is required";
    }
    if (!formData.end_date) {
      errors.end_date =
        language === "ms" ? "Tarikh tamat diperlukan" : "End date is required";
    } else if (formData.start_date && formData.end_date < formData.start_date) {
      errors.end_date =
        language === "ms"
          ? "Tarikh tamat mesti selepas tarikh mula"
          : "End date must be after start date";
    }
    if (!formData.thumbnail) {
      errors.thumbnail =
        language === "ms"
          ? "Gambar acara diperlukan"
          : "Event thumbnail is required";
    }
    if (formData.has_event_date && !formData.event_date) {
      errors.event_date =
        language === "ms"
          ? "Tarikh event diperlukan"
          : "Event date is required";
    }
    // Location validation when volunteer or participant is enabled
    if (
      (formData.has_volunteer || formData.has_participant) &&
      !formData.address
    ) {
      errors.address =
        language === "ms"
          ? "Lokasi event diperlukan"
          : "Event location is required";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    try {
      const result = await handleSubmit(false);
      if (result?.event?.id) {
        setCreatedEventId(result.event.id);
        setActiveTab("module_selection");
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  const handlePublish = async () => {
    if (!createdEventId) {
      setAlertModal({
        isOpen: true,
        title: language === "ms" ? "Ralat" : "Error",
        message:
          language === "ms"
            ? "Sila simpan event sebagai draf terlebih dahulu."
            : "Please save event as draft first.",
        type: "warning",
      });
      return;
    }

    setPublishing(true);
    try {
      await publishEvent(createdEventId);
      router.push("/ngo/events");
    } catch (err) {
      let errorMessage = "";

      if (err.response?.data?.errors) {
        // Parse Laravel validation errors
        const errors = err.response.data.errors;
        errorMessage = Object.keys(errors)
          .map((key) => `• ${errors[key][0]}`)
          .join("\n");
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else {
        errorMessage =
          language === "ms"
            ? "Gagal menerbitkan event. Sila cuba lagi."
            : "Failed to publish event. Please try again.";
      }

      setAlertModal({
        isOpen: true,
        title:
          language === "ms"
            ? "Ralat Menerbitkan Event"
            : "Error Publishing Event",
        message: errorMessage,
        type: "error",
      });
    } finally {
      setPublishing(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: FileText },
    {
      id: "module_selection",
      label: "Module Selection",
      icon: Users,
      disabled: !createdEventId,
    },
    formData.has_volunteer && {
      id: "volunteer_config",
      label: "Volunteer Config",
      icon: Users,
      disabled: !createdEventId,
    },
    formData.has_donation && {
      id: "donation_config",
      label: "Donation Config",
      icon: DollarSign,
      disabled: !createdEventId,
    },
    formData.has_participant && {
      id: "participant_config",
      label: "Participant Config",
      icon: HandHeart,
      disabled: !createdEventId,
    },
    {
      id: "content",
      label: "Content",
      icon: FileText,
      disabled: !createdEventId,
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/ngo/events"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Create New Event
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Create your event and enable modules as needed
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          {/* Custom Dropdown/Breadcrumb for Mobile/Tablet */}
          <div className="xl:hidden">
            {/* Custom Dropdown Button */}
            <div className="relative" ref={dropdownRef}>
              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-xl pl-14 pr-12 py-3.5 text-sm font-medium text-gray-900 cursor-pointer transition-all duration-200 hover:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 shadow-sm hover:shadow-md text-left"
              >
                {tabs.find((t) => t.id === activeTab)?.label}
              </button>

              {/* Icon Badge - Left */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                  {(() => {
                    const CurrentIcon = tabs.find(
                      (t) => t.id === activeTab
                    )?.icon;
                    return CurrentIcon ? (
                      <CurrentIcon className="h-4 w-4 text-white" />
                    ) : null;
                  })()}
                </div>
              </div>

              {/* Chevron - Right */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className={`w-5 h-5 text-emerald-600 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-50 w-full mt-2 bg-white border-2 border-emerald-200 rounded-xl shadow-lg overflow-hidden"
                  >
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => handleTabNavigation(tab.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                            activeTab === tab.id
                              ? "bg-emerald-50 text-emerald-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              activeTab === tab.id
                                ? "bg-gradient-to-br from-emerald-500 to-blue-500"
                                : "bg-gray-100"
                            }`}
                          >
                            <Icon
                              className={`h-4 w-4 ${
                                activeTab === tab.id
                                  ? "text-white"
                                  : "text-gray-600"
                              }`}
                            />
                          </div>
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Horizontal Tabs for Desktop */}
          <div className="hidden xl:block -mx-4 px-4 overflow-x-auto">
            <div className="flex gap-2 border-b">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabNavigation(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 text-base font-medium transition-colors border-b-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-emerald-600 border-emerald-600"
                        : "text-gray-600 border-transparent hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <form onSubmit={handleSaveDraft} noValidate className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Thumbnail */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <EventThumbnailUpload
                    currentThumbnail={formData.thumbnail}
                    onThumbnailChange={(url) => {
                      handleChange("thumbnail", url);
                      if (validationErrors.thumbnail) {
                        setValidationErrors({
                          ...validationErrors,
                          thumbnail: null,
                        });
                      }
                    }}
                    validationError={validationErrors.thumbnail}
                  />
                </div>

                {/* Basic Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Basic Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Event Title *
                        </label>
                        <HelpTooltip
                          content={
                            language === "ms"
                              ? 'Tajuk yang menarik akan menarik lebih ramai peserta. Contoh: "Larian Amal 2024" atau "Kempen Derma Makanan"'
                              : 'An attractive title will draw more participants. Example: "Charity Run 2024" or "Food Donation Campaign"'
                          }
                          language={language}
                        />
                      </div>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => {
                          handleChange("title", e.target.value);
                          if (validationErrors.title) {
                            setValidationErrors({
                              ...validationErrors,
                              title: null,
                            });
                          }
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                          validationErrors.title
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="e.g., Community Cleanup Drive 2025"
                      />
                      {validationErrors.title && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.title}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => {
                          handleChange("description", e.target.value);
                          if (validationErrors.description) {
                            setValidationErrors({
                              ...validationErrors,
                              description: null,
                            });
                          }
                        }}
                        rows={4}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                          validationErrors.description
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Describe your event..."
                      />
                      {validationErrors.description && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Start Registration Date *
                          </label>
                          <HelpTooltip
                            content={
                              language === "ms"
                                ? "Tarikh lalu telah disekat. Event tidak boleh bermula sebelum hari ini."
                                : "Past dates are disabled. Events cannot start before today."
                            }
                            language={language}
                          />
                        </div>
                        <DateInput
                          value={formData.start_date}
                          onChange={(value) => {
                            handleChange("start_date", value);
                            if (validationErrors.start_date) {
                              setValidationErrors({
                                ...validationErrors,
                                start_date: null,
                              });
                            }
                          }}
                          disablePast={true}
                          compareWith={formData.end_date}
                          compareType="before"
                          language={language}
                          className={`${
                            validationErrors.start_date
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {validationErrors.start_date && (
                          <p className="mt-1 text-sm text-red-600">
                            {validationErrors.start_date}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Registration Date *
                        </label>
                        <DateInput
                          value={formData.end_date}
                          onChange={(value) => {
                            handleChange("end_date", value);
                            if (validationErrors.end_date) {
                              setValidationErrors({
                                ...validationErrors,
                                end_date: null,
                              });
                            }
                          }}
                          min={formData.start_date}
                          compareWith={formData.start_date}
                          compareType="after"
                          language={language}
                          className={`${
                            validationErrors.end_date
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {validationErrors.end_date && (
                          <p className="mt-1 text-sm text-red-600">
                            {validationErrors.end_date}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.has_event_date}
                          onChange={(e) => {
                            handleChange("has_event_date", e.target.checked);
                            if (!e.target.checked) {
                              handleChange("event_date", "");
                              // Clear any event_date validation errors
                              if (validationErrors.event_date) {
                                setValidationErrors({
                                  ...validationErrors,
                                  event_date: null,
                                });
                              }
                            }
                          }}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {language === "ms"
                            ? "Tetapkan tarikh event"
                            : "Set specific event date"}
                        </span>
                      </label>

                      {formData.has_event_date && (
                        <div className="mt-4 pl-7">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Event Date *
                          </label>
                          <DateInput
                            value={formData.event_date}
                            onChange={(value) => {
                              handleChange("event_date", value);
                              if (validationErrors.event_date) {
                                setValidationErrors({
                                  ...validationErrors,
                                  event_date: null,
                                });
                              }
                            }}
                            language={language}
                            className={`${
                              validationErrors.event_date
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {validationErrors.event_date && (
                            <p className="mt-1 text-sm text-red-600">
                              {validationErrors.event_date}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {language === "ms"
                              ? "Tarikh sebenar ketika event berlangsung"
                              : "Actual date when the event takes place"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4 md:space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Quick Guide
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>• Fill in basic event information</li>
                    <li>• Select which modules to enable</li>
                    <li>• Save to continue configuration</li>
                    <li>• Configure modules in detail</li>
                    <li>• Publish when ready!</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={loading || publishing}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          Save & Continue to Modules
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {createdEventId && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      ✓ Event saved! Click "Module Selection" tab to continue.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Module Selection Tab */}
        {activeTab === "module_selection" && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Select which modules you want to enable for this event. You can
                configure them in detail in the next step.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Enable Modules
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Choose the modules you need. Each module adds specific
                functionality to your event.
              </p>

              <div className="space-y-3">
                <ModuleToggle
                  label="Volunteer Module"
                  description="Allow people to register as volunteers for various roles and shifts"
                  checked={formData.has_volunteer}
                  onChange={(checked) => handleChange("has_volunteer", checked)}
                  icon={Users}
                />

                <ModuleToggle
                  label="Donation Module"
                  description="Accept money or item donations for your event"
                  checked={formData.has_donation}
                  onChange={(checked) => handleChange("has_donation", checked)}
                  icon={DollarSign}
                />

                <ModuleToggle
                  label="Participant Module"
                  description="Accept participant registrations with categories and pricing"
                  checked={formData.has_participant}
                  onChange={(checked) =>
                    handleChange("has_participant", checked)
                  }
                  icon={HandHeart}
                />
              </div>
            </div>

            {/* Map Location - Show when volunteer or participant is enabled */}
            {(formData.has_volunteer || formData.has_participant) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Event Location
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Set the location where volunteer activities or participant
                  activities will take place.
                </p>

                {validationErrors.address && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">
                      {validationErrors.address}
                    </p>
                  </div>
                )}

                <SavedLocationPicker
                  value={{
                    address: formData.address || "",
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                  }}
                  onChange={async (location) => {
                    // Update local state immediately for UI feedback
                    handleChange("longitude", location.longitude);
                    handleChange("latitude", location.latitude);
                    handleChange("address", location.address);

                    // Clear error when location is set
                    if (validationErrors.address && location.address) {
                      setValidationErrors({
                        ...validationErrors,
                        address: null,
                      });
                    }

                    // Auto-save to database if event was already created
                    if (createdEventId) {
                      try {
                        const { updateEvent } = await import(
                          "../../../lib/events"
                        );
                        await updateEvent(createdEventId, {
                          ...formData,
                          longitude: location.longitude,
                          latitude: location.latitude,
                          address: location.address,
                        });
                        // Silently save without showing alert for better UX
                      } catch (err) {
                        console.error("Failed to auto-save location:", err);
                        // Show error if auto-save fails
                        setAlertModal({
                          isOpen: true,
                          title: "Error Saving Location",
                          message:
                            err.response?.data?.message ||
                            "Failed to save location. Please try again.",
                          type: "error",
                          onClose: () =>
                            setAlertModal((prev) => ({
                              ...prev,
                              isOpen: false,
                            })),
                        });
                      }
                    }
                  }}
                  placeholder="Search for event location..."
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                ← Back to Basic Info
              </button>
              <button
                type="button"
                onClick={() => {
                  // Determine next tab based on enabled modules
                  let nextTab = "content";
                  if (formData.has_volunteer) nextTab = "volunteer_config";
                  else if (formData.has_donation) nextTab = "donation_config";
                  else if (formData.has_participant)
                    nextTab = "participant_config";

                  // Use validation helper
                  handleTabNavigation(nextTab);
                }}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
              >
                Next: Configure Modules →
              </button>
            </div>
          </div>
        )}

        {/* Volunteer Config Tab */}
        {activeTab === "volunteer_config" && formData.has_volunteer && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Configure volunteer roles and shifts for your event.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <VolunteerRoleManager
                roles={volunteerModule.roles}
                shifts={volunteerModule.shifts}
                onAddRole={volunteerModule.addRole}
                onUpdateRole={volunteerModule.updateRole}
                onRemoveRole={volunteerModule.removeRole}
                onAddShift={volunteerModule.addShift}
                onUpdateShift={volunteerModule.updateShift}
                onRemoveShift={volunteerModule.removeShift}
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab("module_selection")}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                ← Back to Module Selection
              </button>
              <button
                type="button"
                onClick={() => {
                  if (formData.has_donation) setActiveTab("donation_config");
                  else if (formData.has_participant)
                    setActiveTab("participant_config");
                  else setActiveTab("content");
                }}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Donation Config Tab */}
        {activeTab === "donation_config" && formData.has_donation && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Configure donation options for your event (money and/or items).
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <DonationConfigManager
                config={donationModule.config}
                onUpdateConfig={donationModule.updateConfig}
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => {
                  if (formData.has_volunteer) setActiveTab("volunteer_config");
                  else setActiveTab("module_selection");
                }}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (formData.has_participant)
                    setActiveTab("participant_config");
                  else setActiveTab("content");
                }}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Participant Config Tab */}
        {activeTab === "participant_config" && formData.has_participant && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Configure participant categories, fees, and registration
                options.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <ParticipantCategoryManager
                config={participantModule.config}
                categories={participantModule.categories}
                feeTiers={participantModule.feeTiers}
                onUpdateConfig={participantModule.updateConfig}
                onAddCategory={participantModule.addCategory}
                onUpdateCategory={participantModule.updateCat}
                onRemoveCategory={participantModule.removeCategory}
                onAddTier={participantModule.addTier}
                onUpdateTier={participantModule.updateTier}
                onRemoveTier={participantModule.removeTier}
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => {
                  if (formData.has_donation) setActiveTab("donation_config");
                  else if (formData.has_volunteer)
                    setActiveTab("volunteer_config");
                  else setActiveTab("module_selection");
                }}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("content")}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
              >
                Next: Content →
              </button>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && createdEventId && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Add optional content sections to provide more details about your
                event (images, text, etc.)
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <EventSectionsManager
                eventId={createdEventId}
                sections={eventSections}
                event={formData} // Pass formData to check enabled modules
                onUpdate={async () => {
                  // Reload sections after add/update/delete
                  if (createdEventId) {
                    const { getEvent } = await import("../../../lib/events");
                    const data = await getEvent(createdEventId);
                    setEventSections(data.sections || []);
                  }
                }}
              />
            </div>

            {/* Final Actions */}
            <div className="flex justify-between items-center bg-white rounded-lg shadow-sm p-6">
              <button
                type="button"
                onClick={() => {
                  // Navigate to last enabled module config
                  if (formData.has_participant)
                    setActiveTab("participant_config");
                  else if (formData.has_donation)
                    setActiveTab("donation_config");
                  else if (formData.has_volunteer)
                    setActiveTab("volunteer_config");
                  else setActiveTab("module_selection");
                }}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                ← Back
              </button>

              <Link
                href="/ngo/events"
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Save className="h-5 w-5" />
                Save Event
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        type={alertModal.type}
        message={alertModal.message}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        language={language}
      />
    </div>
  );
}
