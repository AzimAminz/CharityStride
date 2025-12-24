"use client";

import { useEventDetail } from "../../../../hooks/useEventDetail";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Heart,
  Share2,
  Bookmark,
  Building,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  Star,
  Info,
  ChevronRight,
  Edit,
  Mail,
  Phone,
} from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";
import Link from "next/link";

export default function EventPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  // Fetch actual event data
  const { event, loading, error } = useEventDetail(id);

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedModule, setSelectedModule] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Set initial module when event loads
  useEffect(() => {
    if (event && !selectedModule) {
      console.log("Module check:", {
        has_participant: event.has_participant,
        has_volunteer: event.has_volunteer,
        has_donation: event.has_donation,
        shouldShowDonation:
          !event.has_participant && !event.has_volunteer && event.has_donation,
      });

      const initialModule = event.has_participant
        ? "participant"
        : event.has_volunteer
        ? "volunteer"
        : event.has_donation
        ? "donation"
        : null;
      setSelectedModule(initialModule);
    }
  }, [event, selectedModule]);

  const handleModuleChange = (module) => {
    setSelectedModule(module);
    setActiveTab("details"); // Auto-switch to Details tab
  };

  const handleRegister = (moduleType = "participant") => {
    router.push(`/ngo/events/${id}/preview/register/${moduleType}`);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description?.substring(0, 100) + "...",
        url: window.location.href,
      });
    } else {
      alert("Share link: " + window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Event not found</p>
      </div>
    );
  }

  const isRegistrationOpen = true; // Always show as open in preview
  const isEventUpcoming = isAfter(
    parseISO(event.end_date || new Date().toISOString()),
    new Date()
  );
  const registrationProgress = event.participant_categories
    ? (event.participant_categories.reduce(
        (sum, cat) => sum + (cat.current_registrations || 0),
        0
      ) /
        event.participant_categories.reduce(
          (sum, cat) => sum + (cat.capacity || 100),
          0
        )) *
      100
    : 0;
  const daysUntilDeadline = event.end_date
    ? Math.ceil((parseISO(event.end_date) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  const registrationStatus = null; // Always show as not registered in preview

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      {/* PREVIEW MODE HEADER */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-2.5 bg-black/70 from-slate-900 via-slate-800 to-teal-900 rounded-lg text-white shadow-lg shadow-teal-500/20 border border-teal-500/20">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <span className="text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-teal-800 to-emerald-100 bg-clip-text text-white">
          Preview Mode
        </span>
        <div className="w-px h-4 bg-white/20"></div>
        <Link
          href={`/ngo/events/${id}/edit`}
          className="text-xs font-semibold hover:text-emerald-300 flex items-center gap-1.5 transition-all hover:gap-2"
        >
          <Edit className="h-3.5 w-3.5" /> Edit Event
        </Link>
      </div>

      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <button
            onClick={() => router.push("/ngo/events")}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Back to My Events</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        {/* Event Banner */}
        <div className="relative h-[380px] lg:h-[480px] overflow-hidden bg-gradient-to-br from-teal-100 via-slate-100 to-emerald-100">
          {event.thumbnail ? (
            <Image
              src={event.thumbnail}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-emerald-500/10" />

          {/* Floating Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              onClick={handleLike}
              className={`p-2.5 rounded-lg backdrop-blur-md border ${
                isLiked
                  ? "bg-white/95 border-red-500/20 text-red-500"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              } transition-all shadow-sm`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            </button>

            <button
              onClick={handleBookmark}
              className={`p-2.5 rounded-lg backdrop-blur-md border ${
                isBookmarked
                  ? "bg-white/95 border-amber-500/20 text-amber-500"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              } transition-all shadow-sm`}
            >
              <Bookmark
                className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
              />
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all shadow-sm"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Event Info Card */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              {/* Left: Event Info */}
              <div className="flex-1">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="px-3 py-1 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                    {event.is_published ? "Published" : "Draft"}
                  </span>

                  {isRegistrationOpen && (
                    <span className="px-3 py-1 rounded-md bg-green-100 text-green-700 border border-green-200 text-xs font-semibold">
                      Registration Open
                    </span>
                  )}

                  {daysUntilDeadline <= 7 && daysUntilDeadline > 0 && (
                    <span className="px-3 py-1 rounded-md bg-red-100 text-red-700 border border-red-200 text-xs font-semibold">
                      ⏰ Closing Soon
                    </span>
                  )}

                  {/* Module Badges */}
                  {event.has_participant && (
                    <span className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold">
                      👥 Participant
                    </span>
                  )}

                  {event.has_volunteer && (
                    <span className="px-3 py-1 rounded-md bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold">
                      ❤️ Volunteer
                    </span>
                  )}

                  {event.has_donation && (
                    <span className="px-3 py-1 rounded-md bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold">
                      💰 Donation
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-5">
                  {event.title}
                </h1>

                {/* Organizer */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-100 bg-emerald-50 flex items-center justify-center">
                    {event.ngo?.logo_url ? (
                      <Image
                        src={event.ngo.logo_url}
                        alt={event.ngo.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <Building className="h-5 w-5 text-emerald-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Organized by</p>
                    <p className="font-semibold text-gray-800">
                      {event.ngo?.name || "Organization"}
                    </p>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {/* Event Date - if available */}
                  {event.event_date && (
                    <InfoCard
                      icon={<Calendar className="h-5 w-5" />}
                      label="Event Date"
                      value={format(parseISO(event.event_date), "dd MMM yyyy")}
                    />
                  )}

                  {/* Address - if available */}
                  {event.address && (
                    <InfoCard
                      icon={<MapPin className="h-5 w-5" />}
                      label="Address"
                      value={event.address}
                    />
                  )}

                  {/* Start Date - label changes based on selected module */}
                  <InfoCard
                    icon={<Calendar className="h-5 w-5" />}
                    label={
                      selectedModule === "donation"
                        ? "Donation Start Date"
                        : "Registration Start"
                    }
                    value={format(
                      parseISO(event.start_date || new Date().toISOString()),
                      "dd MMM yyyy"
                    )}
                  />

                  {/* End Date - label changes based on selected module */}
                  <InfoCard
                    icon={<Clock className="h-5 w-5" />}
                    label={
                      selectedModule === "donation"
                        ? "Donation End Date"
                        : "Registration End"
                    }
                    value={format(
                      parseISO(event.end_date || new Date().toISOString()),
                      "dd MMM yyyy"
                    )}
                  />
                </div>

                {/* Progress Bar */}
                {registrationProgress > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-gray-700 mb-2 font-semibold">
                      <span>Registration Progress</span>
                      <span className="text-teal-600">
                        {Math.round(registrationProgress)}% Filled
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${registrationProgress}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 rounded-full shadow-lg shadow-teal-500/50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Action Card */}
              <div className="lg:w-96">
                <div className="bg-gradient-to-br from-white via-teal-50/30 to-emerald-50/30 rounded-xl border border-teal-200/50 p-6 shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Join This Event
                  </h3>

                  {/* Registration Status */}
                  {registrationStatus ? (
                    <div className="mb-5 p-4 bg-white rounded-lg border border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-emerald-500" />
                        <div>
                          <p className="font-semibold text-gray-800">
                            Already Registered
                          </p>
                          <p className="text-sm text-gray-600">
                            Registration Confirmed
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-5 p-3.5 bg-amber-50/50 rounded-lg border border-amber-200/60">
                      <div className="flex items-center gap-2.5">
                        <Info className="h-5 w-5 text-amber-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            Not Registered Yet
                          </p>
                          <p className="text-xs text-gray-600">
                            Choose how you want to participate below
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Custom Module Selector Dropdown */}
                  <ModuleDropdown
                    event={event}
                    selectedModule={selectedModule}
                    onModuleChange={handleModuleChange}
                  />

                  {/* Action Buttons */}
                  <div className="space-y-2 mb-5">
                    {(event.has_participant || event.has_volunteer) &&
                      selectedModule !== "donation" && (
                        <button
                          onClick={() => handleRegister(selectedModule)}
                          className="w-full px-4 py-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Users className="h-5 w-5" />
                          Register Now
                        </button>
                      )}
                    {event.has_donation && selectedModule === "donation" && (
                      <button
                        onClick={() => handleRegister("donation")}
                        className="w-full px-4 py-3 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <DollarSign className="h-5 w-5" />
                        Donate Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-6">
            {["overview", "details", "organizer"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 font-semibold text-sm border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <OverviewTab key="overview" event={event} />
              )}
              {activeTab === "details" && (
                <DetailsTab
                  key="details"
                  event={event}
                  selectedModule={selectedModule}
                />
              )}
              {activeTab === "organizer" && (
                <OrganizerTab key="organizer" event={event} />
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <OrganizerSidebar event={event} setActiveTab={setActiveTab} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function InfoCard({ icon, label, value }) {
  return (
    <div className="group flex items-start gap-2.5 p-3.5 bg-gradient-to-br from-white to-teal-50/20 rounded-lg border border-teal-100/40 hover:border-teal-200 hover:shadow-sm transition-all">
      <div className="text-teal-600 mt-0.5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// Custom Module Dropdown Component
function ModuleDropdown({ event, selectedModule, onModuleChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const modules = [
    event.has_participant && {
      value: "participant",
      icon: <Users className="h-5 w-5" />,
      title: "Join as Participant",
      description: "Register to run/walk",
      bgGradient: "from-teal-50 to-emerald-50",
      iconGradient: "from-teal-500 to-emerald-500",
      borderColor: "border-teal-300",
    },
    event.has_volunteer && {
      value: "volunteer",
      icon: <Heart className="h-5 w-5" />,
      title: "Volunteer",
      description: "Help organize the event",
      bgGradient: "from-blue-50 to-indigo-50",
      iconGradient: "from-blue-500 to-indigo-500",
      borderColor: "border-blue-300",
    },
    event.has_donation && {
      value: "donation",
      icon: <DollarSign className="h-5 w-5" />,
      title: "Make a Donation",
      description: "Support financially",
      bgGradient: "from-rose-50 to-pink-50",
      iconGradient: "from-rose-500 to-pink-500",
      borderColor: "border-rose-300",
    },
  ].filter(Boolean);

  const currentModule = modules.find((m) => m.value === selectedModule);

  return (
    <div className="mb-5 relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Select Registration Type
      </label>

      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3.5 rounded-xl border-2 transition-all ${
          isOpen
            ? "border-teal-400 ring-2 ring-teal-200/50"
            : "border-gray-300 hover:border-gray-400"
        } bg-white flex items-center justify-between`}
      >
        {currentModule ? (
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-lg bg-gradient-to-br ${currentModule.iconGradient} flex items-center justify-center text-white shadow-sm`}
            >
              {currentModule.icon}
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">
                {currentModule.title}
              </p>
              <p className="text-xs text-gray-500">
                {currentModule.description}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-gray-500">Select a module...</span>
        )}
        <ChevronRight
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </button>

      {/* Dropdown Options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl border-2 border-gray-200 shadow-xl overflow-hidden"
          >
            {modules.map((module) => (
              <button
                key={module.value}
                onClick={() => {
                  onModuleChange(module.value);
                  setIsOpen(false);
                }}
                className={`w-full p-3.5 flex items-center gap-3 transition-all border-b border-gray-100 last:border-0 ${
                  selectedModule === module.value
                    ? `bg-gradient-to-br ${module.bgGradient}`
                    : "hover:bg-gray-50"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-lg bg-gradient-to-br ${module.iconGradient} flex items-center justify-center text-white shadow-sm`}
                >
                  {module.icon}
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {module.title}
                  </p>
                  <p className="text-xs text-gray-600">{module.description}</p>
                </div>
                {selectedModule === module.value && (
                  <CheckCircle className="h-5 w-5 text-teal-600" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-gray-500 mt-2">
        Select to view details in the Details tab
      </p>
    </div>
  );
}

function ModuleCard({ icon, title, description, onClick, disabled }) {
  const getModuleColor = (title) => {
    if (title.includes("Participant"))
      return {
        bg: "bg-gradient-to-br from-teal-50 to-emerald-50",
        iconBg: "bg-gradient-to-br from-teal-500 to-emerald-500",
        hoverBorder: "hover:border-teal-300",
        hoverShadow: "hover:shadow-teal-100",
      };
    if (title.includes("Volunteer"))
      return {
        bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
        iconBg: "bg-gradient-to-br from-blue-500 to-indigo-500",
        hoverBorder: "hover:border-blue-300",
        hoverShadow: "hover:shadow-blue-100",
      };
    return {
      bg: "bg-gradient-to-br from-rose-50 to-pink-50",
      iconBg: "bg-gradient-to-br from-rose-500 to-pink-500",
      hoverBorder: "hover:border-rose-300",
      hoverShadow: "hover:shadow-rose-100",
    };
  };

  const colors = getModuleColor(title);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group w-full text-left p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3.5 ${
        disabled
          ? "border-gray-200 bg-gray-50/50 cursor-not-allowed opacity-60"
          : `${colors.bg} border-transparent ${colors.hoverBorder} hover:shadow-md ${colors.hoverShadow} transform hover:scale-[1.02]`
      }`}
    >
      <div
        className={`h-12 w-12 rounded-xl ${colors.iconBg} flex items-center justify-center flex-shrink-0 text-white shadow-md group-hover:scale-110 transition-transform duration-300`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900 group-hover:text-teal-900 transition-colors">
          {title}
        </h4>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
    </button>
  );
}

function StatCard({ value, label, prefix = "" }) {
  return (
    <div>
      <p className="text-2xl font-bold text-gray-900">
        {prefix}
        {value}
      </p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  );
}

// Tab Components
function OverviewTab({ event }) {
  const overviewSections =
    event.sections
      ?.filter((s) => s.category === "overview")
      .sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Event Title & Description - Always First */}
      <section>
        <h2 className="text-3xl px-4 font-bold text-gray-900 mb-4">
          About This Event
        </h2>
        <h3 className="text-2xl font-semibold px-4 text-gray-900 ">
          {event.title}
        </h3>
        <p className="text-gray-700 text-lg px-4 leading-relaxed whitespace-pre-wrap">
          {event.description}
        </p>
      </section>

      {/* Overview Sections - Ordered by database order field */}
      {overviewSections.map((section) => (
        <section key={section.id}>
          {section.title && (
            <h3 className="text-2xl px-4 font-semibold text-gray-900 ">
              {section.title}
            </h3>
          )}
          {section.content && (
            <p className="text-gray-700 text-lg px-4 leading-relaxed  whitespace-pre-wrap">
              {section.content}
            </p>
          )}
          {section.images?.length > 0 && (
            <div className="flex flex-col gap-4 mt-4">
              {section.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto"
                >
                  <Image
                    src={img}
                    alt={section.title || "Event image"}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* Event Location Map - Display at bottom if coordinates exist */}
      {event.latitude && event.longitude && (
        <section>
          <h3 className="text-2xl px-4 font-semibold text-gray-900 mb-4">
            Event Location
          </h3>
          <div className="px-4">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="w-full h-[400px] relative">
                <iframe
                  src={`https://www.google.com/maps?q=${event.latitude},${event.longitude}&output=embed&z=15`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>

              {/* Address Details */}
              {event.address && (
                <div className="p-6 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-2">
                        Address
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {event.address}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </motion.div>
  );
}

function DetailsTab({ event, selectedModule: propSelectedModule }) {
  const [localSelectedModule, setLocalSelectedModule] = useState(
    propSelectedModule ||
      (event.has_participant
        ? "participant"
        : event.has_volunteer
        ? "volunteer"
        : event.has_donation
        ? "donation"
        : null)
  );

  // Volunteer filtering state
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const SHIFTS_PER_PAGE = 3;

  // Participant filtering state
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Use prop if available, otherwise use local state
  const selectedModule = propSelectedModule || localSelectedModule;

  const getModuleSections = () => {
    if (!selectedModule) return [];
    const categoryMap = {
      participant: "participant_details",
      volunteer: "volunteer_details",
      donation: "donation_details",
    };
    return (
      event.sections?.filter(
        (s) => s.category === categoryMap[selectedModule]
      ) || []
    );
  };

  const moduleSections = getModuleSections();
  const hasAnyModule =
    event.has_participant || event.has_volunteer || event.has_donation;

  // Get all shifts from all volunteer roles
  const allShifts =
    event.volunteer_roles?.flatMap(
      (role) => role.shifts?.map((shift) => ({ ...shift, role })) || []
    ) || [];

  // Filter shifts
  const filteredShifts = allShifts.filter((shift) => {
    const matchesRole =
      selectedRole === "all" || shift.role.id === parseInt(selectedRole);
    const matchesDate =
      selectedDate === "all" || shift.shift_date === selectedDate;
    return matchesRole && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredShifts.length / SHIFTS_PER_PAGE);
  const paginatedShifts = filteredShifts.slice(
    (currentPage - 1) * SHIFTS_PER_PAGE,
    currentPage * SHIFTS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRole, selectedDate]);

  // Get unique dates
  const uniqueDates = [...new Set(allShifts.map((s) => s.shift_date))].sort();

  // Get selected shift for map
  const selectedShift = paginatedShifts[0]; // Show first shift's location

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Module-Specific Details */}
      {hasAnyModule && (
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Registration Details
          </h3>

          {/* Volunteer Specific Content */}
          {selectedModule === "volunteer" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              {event.volunteer_roles?.length > 0 ? (
                <>
                  {/* Filters */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Filter Shifts
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Role Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Volunteer Role
                        </label>
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Roles</option>
                          {event.volunteer_roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.role_type?.name_en || role.custom_role_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Date Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Shift Date
                        </label>
                        <select
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Dates</option>
                          {uniqueDates.map((date) => (
                            <option key={date} value={date}>
                              {format(parseISO(date), "dd MMM yyyy")}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Select a role and date to view available shifts and
                      location
                    </p>
                  </div>

                  {/* Shifts List */}
                  {filteredShifts.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">
                        Available Shifts ({filteredShifts.length})
                      </h4>

                      {paginatedShifts.map((shift) => {
                        const registered = 0; // TODO: Get from registrations
                        const capacity = shift.capacity;
                        const percentage = (registered / capacity) * 100;

                        // Convert to 12-hour format
                        const formatTime12Hour = (time24) => {
                          if (!time24) return "";
                          const [hours, minutes] = time24.split(":");
                          const hour = parseInt(hours);
                          const ampm = hour >= 12 ? "PM" : "AM";
                          const hour12 = hour % 12 || 12;
                          return `${hour12}:${minutes} ${ampm}`;
                        };

                        return (
                          <div
                            key={shift.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-semibold text-gray-900">
                                  {shift.role.role_type?.name_en ||
                                    shift.role.custom_role_name ||
                                    "Volunteer Role"}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  {format(
                                    parseISO(shift.shift_date),
                                    "EEEE, dd MMM yyyy"
                                  )}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {formatTime12Hour(shift.start_time)} -{" "}
                                  {formatTime12Hour(shift.end_time)}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  capacity - registered > 0
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {capacity - registered > 0
                                  ? "Available"
                                  : "Full"}
                              </span>
                            </div>

                            {/* Capacity Progress Bar */}
                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Capacity</span>
                                <span className="font-medium text-gray-900">
                                  {registered} / {capacity} filled
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-teal-600 h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t">
                          <button
                            onClick={() =>
                              setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ← Previous
                          </button>
                          <span className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                          </span>
                          <button
                            onClick={() =>
                              setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next →
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No shifts available for selected filters
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded">
                  <p className="text-gray-500">
                    No volunteer roles created yet. Add roles in edit mode
                    first.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Donation Specific Content */}
          {selectedModule === "donation" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              {event.donation_config &&
              (event.donation_config.accepts_money ||
                event.donation_config.accepts_items) ? (
                <>
                  {/* Money Donations */}
                  {event.donation_config.accepts_money &&
                    event.money_donation_options?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <span className="text-2xl mr-2">💰</span>
                          Money Donation Options
                        </h4>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {event.money_donation_options.map((option, idx) => (
                            <div
                              key={idx}
                              className="border border-gray-200 rounded-lg p-5 hover:border-emerald-300 transition-colors bg-gradient-to-br from-emerald-50 to-white"
                            >
                              <div className="text-3xl font-bold text-emerald-700 mb-2">
                                RM{" "}
                                {(
                                  (parseInt(option.suggested_amount) || 0) / 100
                                ).toFixed(2)}
                              </div>
                              {option.description && (
                                <p className="text-sm text-gray-600 mt-2">
                                  {option.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Item Donations */}
                  {event.donation_config.accepts_items &&
                    event.item_donation_options?.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <span className="text-2xl mr-2">📦</span>
                          Item Donation Options
                        </h4>
                        <div className="space-y-3">
                          {event.item_donation_options.map((option, idx) => (
                            <div
                              key={idx}
                              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors bg-gradient-to-r from-blue-50 to-white"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {option.item_category && (
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                        {option.item_category}
                                      </span>
                                    )}
                                    <h5 className="font-semibold text-gray-900">
                                      {option.item_name}
                                    </h5>
                                  </div>
                                  {option.item_description && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {option.item_description}
                                    </p>
                                  )}
                                </div>
                                {option.target_quantity && (
                                  <div className="text-right ml-4">
                                    <div className="text-sm text-gray-500">
                                      Target
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                      {option.target_quantity}{" "}
                                      {option.unit || "units"}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded">
                  <p className="text-gray-500">
                    No donation options configured yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Participant Specific Content */}
          {selectedModule === "participant" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              {event.participant_categories?.length > 0 ? (
                <>
                  {/* Category Filter */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Select Category
                    </h4>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="all">All Categories</option>
                      {event.participant_categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Categories Display */}
                  <div className="space-y-4">
                    {(selectedCategory === "all"
                      ? event.participant_categories
                      : event.participant_categories.filter(
                          (c) => c.id == selectedCategory
                        )
                    ).map((category) => {
                      const registered = 0; // TODO: Get from registrations
                      const capacity = category.capacity;
                      const isUnlimited = !capacity || capacity === 0;
                      const percentage = isUnlimited
                        ? 0
                        : (registered / capacity) * 100;

                      return (
                        <div
                          key={category.id}
                          className="border border-gray-200 rounded-lg p-5 hover:border-teal-300 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-semibold text-gray-900 text-lg">
                                {category.category_name}
                              </h5>
                              <p className="text-sm text-gray-600 mt-1">
                                Fee:{" "}
                                {Number(category.base_fee) === 0 ||
                                !category.base_fee
                                  ? "Free"
                                  : `RM ${(
                                      (Number(category.base_fee) || 0) / 100
                                    ).toFixed(2)}`}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                isUnlimited
                                  ? "bg-blue-100 text-blue-700"
                                  : capacity - registered > 0
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {isUnlimited
                                ? "Unlimited"
                                : capacity - registered > 0
                                ? "Available"
                                : "Full"}
                            </span>
                          </div>

                          {/* Progress Bar or Registration Count */}
                          {isUnlimited ? (
                            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                  Registered Participants
                                </span>
                                <span className="text-2xl font-bold text-blue-700">
                                  {registered}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Capacity</span>
                                <span className="font-medium text-gray-900">
                                  {registered} / {capacity} filled
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-teal-600 h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded">
                  <p className="text-gray-500">
                    No participant categories created yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Module Sections */}
          {moduleSections.length > 0 && (
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-gray-900">
                Additional Information
              </h4>
              {moduleSections.map((section) => (
                <div
                  key={section.id}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  {section.title && (
                    <h5 className="text-lg font-semibold text-gray-900 mb-2">
                      {section.title}
                    </h5>
                  )}
                  {section.content && (
                    <p className="text-gray-700 whitespace-pre-wrap mb-4">
                      {section.content}
                    </p>
                  )}
                  {section.images?.length > 0 && (
                    <div className="flex flex-col gap-4">
                      {section.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 w-full max-w-md mx-auto"
                        >
                          <Image
                            src={img}
                            alt={section.title || "Section image"}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Dynamic Map - Only show when specific role selected and has coordinates */}
          {selectedModule === "volunteer" &&
          selectedRole !== "all" &&
          filteredShifts.length > 0 ? (
            selectedShift?.role?.latitude && selectedShift?.role?.longitude ? (
              <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900">Location</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedShift.role.location || "Event location"}
                  </p>
                </div>
                <div className="w-full h-[400px]">
                  <iframe
                    src={`https://www.google.com/maps?q=${selectedShift.role.latitude},${selectedShift.role.longitude}&output=embed&z=15`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            ) : null
          ) : null}

          {/* Dynamic Map for Participant Category */}
          {selectedModule === "participant" &&
            selectedCategory !== "all" &&
            (() => {
              const category = event.participant_categories?.find(
                (c) => c.id == selectedCategory
              );
              return category?.latitude && category?.longitude ? (
                <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-900">
                      Event Location
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {category.location || event.location || "Event location"}
                    </p>
                  </div>
                  <div className="w-full h-[400px]">
                    <iframe
                      src={`https://www.google.com/maps?q=${category.latitude},${category.longitude}&output=embed&z=15`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              ) : null;
            })()}

          {/* Empty State */}
          {!selectedModule && (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-600">
                Select a registration type to view details
              </p>
            </div>
          )}
        </section>
      )}
    </motion.div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-3 border-b border-gray-100">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="text-gray-900 font-semibold">{value}</span>
    </div>
  );
}

function OrganizerTab({ event }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          About the Organizer
        </h3>
        <div className="p-6 bg-gray-50 rounded-2xl">
          <div className="flex items-center gap-4 mb-4">
            {event.ngo?.logo_url ? (
              <Image
                src={event.ngo.logo_url}
                alt={event.ngo.name}
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <Building className="h-8 w-8 text-emerald-600" />
              </div>
            )}
            <div>
              <h4 className="font-bold text-gray-900 text-lg">
                {event.ngo?.name || "Organization Name"}
              </h4>
              <p className="text-sm text-gray-600">
                Reg: {event.ngo?.registration_no || "N/A"}
              </p>
            </div>
          </div>
          {event.ngo?.description && (
            <p className="text-gray-700 text-sm leading-relaxed">
              {event.ngo.description}
            </p>
          )}
        </div>
      </section>

      {/* NGO Office Address & Map */}
      {(event.ngo?.address || event.ngo?.latitude) && (
        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Office Location
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Map */}
            {event.ngo?.latitude && event.ngo?.longitude && (
              <div className="w-full h-[300px] relative">
                <iframe
                  src={`https://www.google.com/maps?q=${event.ngo.latitude},${event.ngo.longitude}&output=embed&z=15`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Address Details */}
            {event.ngo?.address && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-2">Address</p>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {event.ngo.address}
                      {event.ngo.city && `, ${event.ngo.city}`}
                      {event.ngo.state && `, ${event.ngo.state}`}
                      {event.ngo.postcode && ` ${event.ngo.postcode}`}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                  {event.ngo?.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <a
                        href={`mailto:${event.ngo.contact_email}`}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        {event.ngo.contact_email}
                      </a>
                    </div>
                  )}
                  {event.ngo?.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a
                        href={`tel:${event.ngo.contact_phone}`}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        {event.ngo.contact_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </motion.div>
  );
}

function OrganizerSidebar({ event, setActiveTab }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-base font-bold text-gray-900 mb-4">
        About the Organizer
      </h3>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {event.ngo?.logo_url ? (
            <Image
              src={event.ngo.logo_url}
              alt={event.ngo.name}
              width={44}
              height={44}
              className="rounded-lg"
            />
          ) : (
            <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
              <Building className="h-5 w-5 text-slate-600" />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              {event.ngo?.name || "Organization"}
            </p>
            <p className="text-xs text-gray-500">Event Organizer</p>
          </div>
        </div>

        {event.ngo?.description && (
          <p className="text-gray-700 text-xs leading-relaxed line-clamp-3">
            {event.ngo.description}
          </p>
        )}

        <button
          onClick={() => setActiveTab("organizer")}
          className="w-full text-center text-slate-700 hover:text-slate-900 font-medium text-xs py-2 hover:bg-slate-50 rounded-lg transition-colors"
        >
          View Full Profile →
        </button>
      </div>
    </div>
  );
}
