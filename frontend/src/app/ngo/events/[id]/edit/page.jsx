"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
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
    has_volunteer: false,
    has_donation: false,
    has_participant: false,
    thumbnail: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [eventSections, setEventSections] = useState([]);

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
        has_volunteer: event.has_volunteer || false,
        has_donation: event.has_donation || false,
        has_participant: event.has_participant || false,
        thumbnail: event.thumbnail || null,
      });
      setEventSections(event.sections || []);
    }
  }, [event]);

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
    { id: "modules", label: "Modules", icon: Users },
    { id: "content", label: "Content", icon: FileText },
  ];

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
              <p className="text-gray-600 mt-1">
                Update your event details and manage modules
              </p>
            </div>
            <Link
              href={`/ngo/events/${id}/preview`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "text-emerald-600 border-emerald-600"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        onChange={(e) => handleChange("title", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., Community Cleanup Drive 2025"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          handleChange("description", e.target.value)
                        }
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Describe your event..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          value={formData.start_date}
                          onChange={(e) =>
                            handleChange("start_date", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date *
                        </label>
                        <input
                          type="date"
                          value={formData.end_date}
                          onChange={(e) =>
                            handleChange("end_date", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Module Selection */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Enable Modules
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Select which modules you want to enable for this event.
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

        {/* Modules Tab */}
        {activeTab === "modules" && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Configure the modules you enabled. These settings determine how
                users can interact with your event.
              </p>
            </div>

            {/* Volunteer Module */}
            {formData.has_volunteer && (
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
            )}

            {/* Donation Module */}
            {formData.has_donation && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <DonationConfigManager
                  config={donationModule.config}
                  moneyOptions={donationModule.moneyOptions}
                  itemOptions={donationModule.itemOptions}
                  onUpdateConfig={donationModule.updateConfig}
                  onAddMoneyOption={donationModule.addMoneyOption}
                  onUpdateMoneyOption={donationModule.updateMoneyOpt}
                  onRemoveMoneyOption={donationModule.removeMoneyOption}
                  onAddItemOption={donationModule.addItemOption}
                  onUpdateItemOption={donationModule.updateItemOpt}
                  onRemoveItemOption={donationModule.removeItemOption}
                />
              </div>
            )}

            {/* Participant Module */}
            {formData.has_participant && (
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
            )}

            {!formData.has_volunteer &&
              !formData.has_donation &&
              !formData.has_participant && (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <p className="text-gray-500">
                    No modules enabled. Go back to Basic Info to enable modules.
                  </p>
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
                onClick={() => setActiveTab("modules")}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                ← Back to Modules
              </button>

              <div className="flex gap-3">
                <Link
                  href="/ngo/events"
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Back to Events
                </Link>
                {event?.status !== "published" && (
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={publishing}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
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
        )}
      </div>
    </div>
  );
}
