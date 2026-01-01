"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { useEventDetail } from "../../../../hooks/useEventDetail";
import { useVolunteerModule } from "../../../../hooks/useVolunteerModule";
import { useDonationModule } from "../../../../hooks/useDonationModule";
import { useParticipantModule } from "../../../../hooks/useParticipantModule";
import { updateEvent, publishEvent } from "../../../../lib/events";
import EventThumbnailUpload from "../../../../components/EventThumbnailUpload";
import ModuleToggle from "../../../../components/event-modules/ModuleToggle";
import VolunteerRoleManager from "../../../../components/event-modules/VolunteerRoleManager";
import DonationConfigManager from "../../../../components/event-modules/DonationConfigManager";
import ParticipantCategoryManager from "../../../../components/event-modules/ParticipantCategoryManager";
import EventSectionsManager from "../../../../components/EventSectionsManager";
import { DateInput } from "../../../../components/inputs";
import SavedLocationPicker from "../../../../components/SavedLocationPicker";
import AlertModal from "../../../../components/AlertModal";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const { event, loading: loadingEvent, error: loadError } = useEventDetail(id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    event_date: "",
    has_event_date: false,
    longitude: null,
    latitude: null,
    address: "",
    has_volunteer: false,
    has_donation: false,
    has_participant: false,
    thumbnail: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [eventSections, setEventSections] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Module hooks (initialized with event ID)
  const volunteerModule = useVolunteerModule(id);
  const donationModule = useDonationModule(id);
  const participantModule = useParticipantModule(id);

  // Load event data into form
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        // Extract date part only (YYYY-MM-DD) from datetime
        start_date: event.start_date ? event.start_date.split("T")[0] : "",
        end_date: event.end_date ? event.end_date.split("T")[0] : "",
        event_date: event.event_date ? event.event_date.split("T")[0] : "",
        has_event_date: event.has_event_date || false,
        longitude: event.longitude || null,
        latitude: event.latitude || null,
        address: event.address || "",
        has_volunteer: event.has_volunteer || false,
        has_donation: event.has_donation || false,
        has_participant: event.has_participant || false,
        thumbnail: event.thumbnail || null,
      });
      setEventSections(event.sections || []);
    }
  }, [event]);

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
          if (!formData.address) errors.push("Event location (address)");
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
        (!formData.address || !formData.latitude || !formData.longitude)
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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-save when module toggles are changed
  const handleModuleToggle = async (field, value) => {
    // Update local state first for immediate UI feedback
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-save to database
    try {
      const updatedData = { ...formData, [field]: value };
      await updateEvent(id, updatedData);
      // Silently save without showing alert for better UX
    } catch (err) {
      // Show error if auto-save fails
      setError(err.response?.data?.message || "Failed to save module changes");
      // Revert the change if save failed
      setFormData((prev) => ({ ...prev, [field]: !value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Custom validation - synced with create page
    const errors = {};
    if (!formData.title?.trim()) {
      errors.title = "Title is required";
    }
    if (!formData.description?.trim()) {
      errors.description = "Description is required";
    }
    if (!formData.start_date) {
      errors.start_date = "Start date is required";
    }
    if (!formData.end_date) {
      errors.end_date = "End date is required";
    } else if (formData.start_date && formData.end_date < formData.start_date) {
      errors.end_date = "End date must be after start date";
    }
    if (!formData.thumbnail) {
      errors.thumbnail = "Event thumbnail is required";
    }
    if (formData.has_event_date && !formData.event_date) {
      errors.event_date = "Event date is required when enabled";
    }
    // Location validation when volunteer or participant is enabled
    if (
      (formData.has_volunteer || formData.has_participant) &&
      !formData.address
    ) {
      errors.address = "Event location is required";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setLoading(true);
    setError(null);

    try {
      await updateEvent(id, formData);
      alert("Event updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update event");
      alert(err.response?.data?.message || "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await publishEvent(id);
      alert("Event published successfully!");
      router.push("/ngo/events");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to publish event");
    } finally {
      setPublishing(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: FileText },
    { id: "module_selection", label: "Module Selection", icon: Users },
    formData.has_volunteer && {
      id: "volunteer_config",
      label: "Volunteer Config",
      icon: Users,
    },
    formData.has_donation && {
      id: "donation_config",
      label: "Donation Config",
      icon: DollarSign,
    },
    formData.has_participant && {
      id: "participant_config",
      label: "Participant Config",
      icon: HandHeart,
    },
    { id: "content", label: "Content", icon: FileText },
  ].filter(Boolean);

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-700">{loadError}</p>
          <Link
            href="/ngo/events"
            className="inline-block mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Edit Event
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Update your event details and manage modules
              </p>
            </div>
            <Link
              href={`/ngo/events/${id}/preview`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm md:text-base"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Link>
          </div>
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
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Thumbnail */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <EventThumbnailUpload
                    currentThumbnail={formData.thumbnail}
                    onThumbnailChange={(url) => handleChange("thumbnail", url)}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event Title *
                      </label>
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
                        required
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
                        required
                      />
                      {validationErrors.description && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Registration Date *
                        </label>
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
                              // Clear validation errors
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
                          Set specific event date
                        </span>
                      </label>

                      {formData.has_event_date && (
                        <div className="mt-4 pl-7">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Event Date *
                          </label>
                          <input
                            type="date"
                            value={formData.event_date}
                            onChange={(e) => {
                              handleChange("event_date", e.target.value);
                              // Clear validation error when user types
                              if (validationErrors.event_date) {
                                setValidationErrors({
                                  ...validationErrors,
                                  event_date: null,
                                });
                              }
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
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
                            Actual date when the event takes place
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Edit Mode
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>• Update basic event information</li>
                    <li>• Enable/disable modules</li>
                    <li>• Configure module details</li>
                    <li>• Add content sections</li>
                    <li>• Publish when ready!</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={loading}
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
                          Save Changes
                        </>
                      )}
                    </button>

                    {event?.status !== "published" && (
                      <button
                        type="button"
                        onClick={handlePublish}
                        disabled={publishing}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                      >
                        {publishing ? (
                          <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Globe className="h-5 w-5" />
                            Publish Event
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Module Selection Tab */}
        {activeTab === "module_selection" && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Select which modules you want to enable for this event. Changes
                are saved automatically.
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
                  onChange={(checked) =>
                    handleModuleToggle("has_volunteer", checked)
                  }
                  icon={Users}
                />

                <ModuleToggle
                  label="Donation Module"
                  description="Accept money or item donations for your event"
                  checked={formData.has_donation}
                  onChange={(checked) =>
                    handleModuleToggle("has_donation", checked)
                  }
                  icon={DollarSign}
                />

                <ModuleToggle
                  label="Participant Module"
                  description="Accept participant registrations with categories and pricing"
                  checked={formData.has_participant}
                  onChange={(checked) =>
                    handleModuleToggle("has_participant", checked)
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

                    // Auto-save to database
                    try {
                      const updatedData = {
                        ...formData,
                        longitude: location.longitude,
                        latitude: location.latitude,
                        address: location.address,
                      };
                      await updateEvent(id, updatedData);
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
                          setAlertModal((prev) => ({ ...prev, isOpen: false })),
                      });
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
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back
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
        {activeTab === "content" && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Add optional content sections to provide more details about your
                event (images, text, etc.)
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <EventSectionsManager
                eventId={id}
                sections={eventSections}
                event={formData} // Pass formData to check enabled modules
                onUpdate={async () => {
                  // Reload event to get updated sections
                  if (id) {
                    const { getEvent } = await import("../../../../lib/events");
                    const data = await getEvent(id);
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

              {event?.status !== "published" && (
                <button
                  type="button"
                  onClick={async () => {
                    // Save changes first
                    setLoading(true);
                    try {
                      await updateEvent(id, formData);
                      router.push("/ngo/events");
                    } catch (err) {
                      setAlertModal({
                        isOpen: true,
                        title: "Error Saving Event",
                        message:
                          err.response?.data?.message || "Failed to save event",
                        type: "error",
                        onClose: () =>
                          setAlertModal((prev) => ({ ...prev, isOpen: false })),
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Save Event
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={alertModal.onClose}
      />
    </div>
  );
}
