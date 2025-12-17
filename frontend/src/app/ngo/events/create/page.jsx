"use client";

import { useState } from "react";
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
} from "lucide-react";
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

export default function CreateEventPage() {
  const router = useRouter();
  const { formData, handleChange, handleSubmit, loading, error } =
    useEventForm();
  const { language } = useLanguage();

  const [createdEventId, setCreatedEventId] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
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

  // Volunteer Module hooks (only initialized after event created)
  const volunteerModule = useVolunteerModule(createdEventId);
  const donationModule = useDonationModule(createdEventId);
  const participantModule = useParticipantModule(createdEventId);

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
    }
    if (!formData.thumbnail) {
      errors.thumbnail =
        language === "ms"
          ? "Gambar acara diperlukan"
          : "Event thumbnail is required";
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
        setActiveTab("modules");
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
      id: "modules",
      label: "Modules",
      icon: Users,
      disabled: !createdEventId,
    },
    {
      id: "content",
      label: "Content",
      icon: FileText,
      disabled: !createdEventId,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Page Header with Instructions */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6 mb-6 border border-emerald-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {language === "ms" ? "Cipta Event Anda" : "Create Your Event"}
          </h2>
          <p className="text-gray-700 mb-4">
            {language === "ms"
              ? "Ikuti 3 langkah mudah untuk mencipta event amal anda. Mulakan dengan maklumat asas, kemudian pilih modul yang diperlukan."
              : "Follow 3 easy steps to create your charity event. Start with basic information, then choose the modules you need."}
          </p>

          {/* Progress Indicator */}
          <ProgressIndicator
            currentStep={
              activeTab === "basic" ? 1 : activeTab === "modules" ? 2 : 3
            }
            language={language}
          />

          {/* Quick Tips */}
          <div className="mt-4 pt-4 border-t border-emerald-200">
            <p className="text-sm text-gray-600 flex items-start gap-2">
              <span className="text-emerald-600 font-semibold">💡</span>
              {language === "ms"
                ? "Tip: Simpan sebagai draf dahulu, kemudian tambah butiran lanjut dalam tab Modul dan Kandungan."
                : "Tip: Save as draft first, then add more details in the Modules and Content tabs."}
            </p>
          </div>
        </div>
      </div>

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
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600 mt-1">
            Create your event and enable modules as needed
          </p>
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
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "text-emerald-600 border-emerald-600"
                    : tab.disabled
                    ? "text-gray-400 border-transparent cursor-not-allowed"
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
          <form onSubmit={handleSaveDraft} noValidate className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                            Start Date *
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
                          End Date *
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
                        />
                        {validationErrors.end_date && (
                          <p className="mt-1 text-sm text-red-600">
                            {validationErrors.end_date}
                          </p>
                        )}
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
                    Select which modules you want to enable for this event. You
                    can configure them in detail after creating the event.
                  </p>

                  <div className="space-y-3">
                    <ModuleToggle
                      label="Volunteer Module"
                      description="Allow people to register as volunteers for various roles and shifts"
                      checked={formData.has_volunteer}
                      onChange={(checked) =>
                        handleChange("has_volunteer", checked)
                      }
                      icon={Users}
                    />

                    <ModuleToggle
                      label="Donation Module"
                      description="Accept money or item donations for your event"
                      checked={formData.has_donation}
                      onChange={(checked) =>
                        handleChange("has_donation", checked)
                      }
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
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
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
                          Save & Continue
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {createdEventId && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      ✓ Event saved! Click "Modules" tab to configure.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Modules Tab */}
        {activeTab === "modules" && (
          <div className="space-y-6">
            {/* Modules Section Header */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === "ms"
                    ? "Pilih Modul Event"
                    : "Select Event Modules"}
                </h3>
                <HelpTooltip
                  content={
                    language === "ms"
                      ? "Aktifkan modul yang diperlukan untuk event anda. Anda boleh menambah butiran lanjut selepas menyimpan draf."
                      : "Enable the modules you need for your event. You can add more details after saving the draft."
                  }
                  language={language}
                />
              </div>
              <p className="text-sm text-gray-600">
                {language === "ms"
                  ? "Modul membantu anda mengurus peserta, sukarelawan, dan derma dengan lebih teratur."
                  : "Modules help you manage participants, volunteers, and donations more efficiently."}
              </p>
            </div>

            {!createdEventId && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Configure the modules you enabled. These settings determine
                  how users can interact with your event.
                </p>
              </div>
            )}

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
                  Save as Draft
                </Link>
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
              </div>
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
