"use client";

import { useEventDetail } from "../../hooks/useEventDetail";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Heart,
  Share2,
  Building,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  Star,
  Info,
  ChevronRight,
  Mail,
  Phone,
  X,
} from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";
import LoginModal from "../../login/components/LoginModal";
import AlertModal from "../../components/AlertModal";

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id;

  // Fetch actual event data using public API (no authentication required)
  const { event, loading, error } = useEventDetail(id, true);

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedModule, setSelectedModule] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Check for successful login via URL parameter
  useEffect(() => {
    const loginSuccess = searchParams?.get("login");

    if (loginSuccess === "success") {
      setShowSuccessMessage(true);

      // Auto-close after 2 seconds and remove URL parameter
      setTimeout(() => {
        setShowSuccessMessage(false);
        router.replace(`/events/${id}`, { scroll: false });
      }, 2000);
    }
  }, [searchParams, id, router]);

  // Debug: Log when showSuccessMessage state changes
  useEffect(() => {
    console.log("showSuccessMessage state changed to:", showSuccessMessage);
  }, [showSuccessMessage]);

  // Countdown timer for registration deadline
  useEffect(() => {
    if (!event?.end_date) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const endDate = new Date(event.end_date);
      const diff = endDate - now;

      if (diff <= 0) {
        setTimeRemaining({ expired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds, expired: false });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [event?.end_date]);

  // Set initial module when event loads
  useEffect(() => {
    if (event && !selectedModule) {
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

  const handleRegister = async (moduleType = "participant") => {
    // Check if user is authenticated by checking localStorage token
    // This avoids making an API call that would trigger a 401 redirect
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token) {
      // User is logged in, proceed to registration
      router.push(`/events/${id}/register/${moduleType}`);
    } else {
      // User not logged in, show login modal
      setPendingRegistration(moduleType);
      setShowLoginModal(true);
    }
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

  const isRegistrationOpen = true;
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

  const registrationStatus = null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      {/* Success Message Modal */}
      <AlertModal
        type="success"
        message="✅ Successfully logged in! Welcome back."
        isOpen={showSuccessMessage}
        onClose={() => setShowSuccessMessage(false)}
      />

      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <button
            onClick={() => router.push("/events")}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Back to Events</span>
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
                  {isRegistrationOpen && (
                    <span className="px-3 py-1 rounded-md bg-green-100 text-green-700 border border-green-200 text-xs font-semibold">
                      Registration Open
                    </span>
                  )}

                  {daysUntilDeadline <= 7 && daysUntilDeadline > 0 && (
                    <span className="px-3 py-1 rounded-md bg-red-100 text-red-700 border border-red-200 text-xs font-semibold">
                      Closing Soon
                    </span>
                  )}

                  {/* Module Badges */}
                  {event.has_participant && (
                    <span className="px-3 py-1 rounded-md bg-green-100 text-green-700 border border-green-200 text-xs font-semibold">
                      Participant
                    </span>
                  )}

                  {event.has_volunteer && (
                    <span className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold">
                      Volunteer
                    </span>
                  )}

                  {event.has_donation && (
                    <span className="px-3 py-1 rounded-md bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold">
                      Donation
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-5">
                  {event.title}
                </h1>

                {/* Registration Countdown */}
                {timeRemaining && (
                  <div className="mb-6">
                    {timeRemaining.expired ? (
                      <div className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-100 to-red-50 border-2 border-red-300 rounded-xl shadow-sm">
                        <Clock className="h-5 w-5 text-red-600" />
                        <span className="text-base font-bold text-red-700">
                          Registration Closed
                        </span>
                      </div>
                    ) : (
                      <div className="relative bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 border-2 border-emerald-400 rounded-2xl p-3 sm:p-5 shadow-xl">
                        {/* Decorative corner accent */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-300/40 to-transparent rounded-bl-full" />

                        <div className="relative">
                          <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <div className="p-2 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg shadow-lg">
                              <Clock className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-emerald-900 block">
                                Registration Closes In
                              </span>
                              <span className="text-xs text-emerald-700">
                                Don't miss out!
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2 sm:gap-3">
                            <div className="bg-gradient-to-br from-white via-emerald-50 to-teal-50 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center border-2 border-emerald-400 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500">
                              <div className="text-xl sm:text-3xl font-black bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent animate-pulse">
                                {timeRemaining.days}
                              </div>
                              <div className="text-[10px] sm:text-xs font-semibold text-gray-600 mt-1 sm:mt-2 uppercase tracking-wider">
                                Days
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-white via-emerald-50 to-teal-50 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center border-2 border-emerald-400 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500">
                              <div className="text-xl sm:text-3xl font-black bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                {String(timeRemaining.hours).padStart(2, "0")}
                              </div>
                              <div className="text-[10px] sm:text-xs font-semibold text-gray-600 mt-1 sm:mt-2 uppercase tracking-wider">
                                Hours
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-white via-emerald-50 to-teal-50 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center border-2 border-emerald-400 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500">
                              <div className="text-xl sm:text-3xl font-black bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                {String(timeRemaining.minutes).padStart(2, "0")}
                              </div>
                              <div className="text-[10px] sm:text-xs font-semibold text-gray-600 mt-1 sm:mt-2 uppercase tracking-wider">
                                Minutes
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-white via-emerald-50 to-teal-50 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center border-2 border-emerald-400 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500">
                              <div className="text-xl sm:text-3xl font-black bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                {String(timeRemaining.seconds).padStart(2, "0")}
                              </div>
                              <div className="text-[10px] sm:text-xs font-semibold text-gray-600 mt-1 sm:mt-2 uppercase tracking-wider">
                                Seconds
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                      iconColor="blue"
                    />
                  )}

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
                    iconColor="orange"
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
                <div className="bg-white rounded-2xl border-2 border-emerald-200 p-6 shadow-xl sticky top-24">
                  <h3 className="text-2xl font-black text-gray-900 mb-5">
                    Join This Event
                  </h3>

                  {/* Registration Status */}
                  {registrationStatus ? (
                    <div className="mb-5 p-4 bg-emerald-50 rounded-xl border-2 border-emerald-500">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-emerald-600" />
                        <div>
                          <p className="font-bold text-gray-900">
                            Already Registered
                          </p>
                          <p className="text-sm text-emerald-700">
                            Registration Confirmed
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-5 p-4 bg-amber-50 rounded-xl border-2 border-amber-300">
                      <div className="flex items-center gap-3">
                        <Info className="h-5 w-5 text-amber-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            Not Registered Yet
                          </p>
                          <p className="text-xs text-gray-700">
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
                  <div className="space-y-3 mb-6">
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

                  {/* Share Section */}
                  <div className="pt-5 mt-5 border-t-2 border-gray-100">
                    <button
                      onClick={handleShare}
                      className="w-full px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share Event
                    </button>
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

      {/* Login Modal - shows when unauthenticated user tries to register */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectUrl={
          typeof window !== "undefined"
            ? window.location.pathname
            : `/events/${id}`
        }
        message="You need to log in to register for this event."
      />
    </div>
  );
}

// Helper Components
function InfoCard({ icon, label, value, iconColor = "teal" }) {
  return (
    <div className="group flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
      <div
        className={`p-3 bg-${iconColor}-100 rounded-xl group-hover:scale-105 transition-transform`}
      >
        <div className={`text-${iconColor}-600`}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-1.5 font-semibold uppercase tracking-wider">
          {label}
        </p>
        <p className="text-base font-bold text-gray-900">{value}</p>
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

// Category Dropdown Component
function CategoryDropdown({ categories, selectedCategory, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCategoryName =
    selectedCategory === "all"
      ? "All Categories"
      : categories.find((c) => c.id == selectedCategory)?.category_name ||
        "Select Category";

  return (
    <div className="relative w-full md:w-1/2" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all flex items-center justify-between text-left"
      >
        <span className="font-medium text-gray-900">
          {selectedCategoryName}
        </span>
        <ChevronRight
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-90" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto">
              {/* All Categories Option */}
              <button
                onClick={() => {
                  onSelect("all");
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors flex items-center justify-between ${
                  selectedCategory === "all"
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-700"
                }`}
              >
                <span className="font-medium">All Categories</span>
                {selectedCategory === "all" && (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                )}
              </button>

              {/* Category Options */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    onSelect(category.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors flex items-center justify-between border-t border-gray-100 ${
                    selectedCategory == category.id
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700"
                  }`}
                >
                  <span className="font-medium">{category.category_name}</span>
                  {selectedCategory == category.id && (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Generic Filter Dropdown Component
function FilterDropdown({ options, selectedValue, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel =
    options.find((opt) => opt.value == selectedValue)?.label || "Select option";

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all flex items-center justify-between text-left"
      >
        <span className="font-medium text-gray-900">{selectedLabel}</span>
        <ChevronRight
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-90" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto">
              {options.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSelect(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors flex items-center justify-between ${
                    index > 0 ? "border-t border-gray-100" : ""
                  } ${
                    selectedValue == option.value
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700"
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                  {selectedValue == option.value && (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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

  // Get today's date in YYYY-MM-DD format (Malaysia time)
  const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

  // Get all upcoming shifts from all volunteer roles
  const allShifts =
    event.volunteer_roles?.flatMap(
      (role) =>
        role.shifts
          ?.filter((shift) => !shift.shift_date || shift.shift_date >= todayStr)
          .map((shift) => ({ ...shift, role })) || []
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

  // Get unique dates - filter by selected role if not "all"
  const uniqueDates = [
    ...new Set(
      allShifts
        .filter(
          (shift) =>
            selectedRole === "all" || shift.role.id === parseInt(selectedRole)
        )
        .map((s) => s.shift_date)
    ),
  ].sort();

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
                        <FilterDropdown
                          options={[
                            { value: "all", label: "All Roles" },
                            ...[
                              ...new Set(allShifts.map((s) => s.role.id)),
                            ].map((roleId) => {
                              const role = event.volunteer_roles.find(
                                (r) => r.id === roleId
                              );
                              return {
                                value: role.id,
                                label:
                                  role.custom_role_name ||
                                  role.role_type?.name_en,
                              };
                            }),
                          ]}
                          selectedValue={selectedRole}
                          onSelect={setSelectedRole}
                        />
                      </div>

                      {/* Date Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Shift Date
                        </label>
                        <FilterDropdown
                          options={[
                            { value: "all", label: "All Dates" },
                            ...uniqueDates.map((date) => ({
                              value: date,
                              label: format(parseISO(date), "dd MMM yyyy"),
                            })),
                          ]}
                          selectedValue={selectedDate}
                          onSelect={setSelectedDate}
                        />
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
                        const registered = shift.current_registrations || 0;
                        const capacity = shift.capacity;
                        const percentage =
                          capacity > 0 ? (registered / capacity) * 100 : 0;

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
                                  {shift.role.custom_role_name ||
                                    shift.role.role_type?.name_en ||
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
                    No volunteer roles created yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Donation Specific Content */}
          {selectedModule === "donation" && (
            <div className="space-y-6">
              {/* Donation Poster */}
              {event.donation_config?.poster_url && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="relative aspect-[1/1.4] w-full max-w-sm mx-auto">
                    <Image
                      src={event.donation_config.poster_url}
                      alt="Donation Poster"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Progress & Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 shadow-sm">
                <div className="text-center space-y-3">
                  <h4 className="text-gray-500 font-medium uppercase tracking-wider text-xs">
                    Total Funds Raised
                  </h4>
                  <div className="text-3xl font-black text-gray-900">
                    RM {((event.stats?.total_raised || 0) / 100).toFixed(2)}
                  </div>

                  {event.donation_config?.has_target && (
                    <div className="space-y-3 max-w-sm mx-auto pt-1">
                      <div className="flex justify-between items-end">
                        <span className="text-gray-600 font-medium text-sm">
                          Progress
                        </span>
                        <span className="text-emerald-600 font-bold text-base">
                          {Math.min(
                            100,
                            Math.round(
                              ((event.stats?.total_raised || 0) /
                                (event.donation_config.target_amount || 1)) *
                                100
                            )
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-200">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(
                              100,
                              ((event.stats?.total_raised || 0) /
                                (event.donation_config.target_amount || 1)) *
                                100
                            )}%`,
                          }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"
                        />
                      </div>
                      <p className="text-gray-500 text-xs text-right">
                        Target: RM{" "}
                        {(
                          (event.donation_config.target_amount || 0) / 100
                        ).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-col items-center">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Users className="h-4 w-4 text-emerald-500" />
                    <span className="font-semibold text-gray-900">
                      {event.stats?.donations || 0}
                    </span>{" "}
                    donors have contributed
                  </div>
                </div>
              </div>
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
                    <CategoryDropdown
                      categories={event.participant_categories}
                      selectedCategory={selectedCategory}
                      onSelect={setSelectedCategory}
                    />
                  </div>

                  {/* Categories Display */}
                  <div className="space-y-4">
                    {(selectedCategory === "all"
                      ? event.participant_categories
                      : event.participant_categories.filter(
                          (c) => c.id == selectedCategory
                        )
                    ).map((category) => {
                      const registered = category.current_registrations || 0;
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
                              <div className="flex items-center gap-2">
                                <h5 className="font-semibold text-gray-900 text-lg">
                                  {category.category_name}
                                </h5>
                                {category.has_bib && (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase tracking-wider">
                                    BIB Included
                                  </span>
                                )}
                              </div>
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
                      {category.location_name ||
                        event.location ||
                        "Event location"}
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

function OrganizerTab({ event }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <section>
        <div className="bg-white rounded-xl p-6">
          {/* NGO Icon and Name Header */}
          <div className="flex items-start gap-4 mb-5">
            {event.ngo?.logo_url ? (
              <div className="flex-shrink-0">
                <Image
                  src={event.ngo.logo_url}
                  alt={event.ngo.name}
                  width={64}
                  height={64}
                  className="rounded-xl"
                />
              </div>
            ) : (
              <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Building className="h-8 w-8 text-emerald-600" />
              </div>
            )}

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {event.ngo?.name || "Organization Name"}
              </h3>

              {/* Description */}
              {event.ngo?.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {event.ngo.description}
                </p>
              )}

              {/* Stats Row - Rating and Events */}
              <div className="flex items-center gap-4 text-sm">
                {/* Rating Stars */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center">
                    {[1, 2, 3, 4].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                    <Star className="h-4 w-4 fill-gray-300 text-gray-300" />
                  </div>
                  <span className="font-semibold text-gray-900">4.8</span>
                  <span className="text-gray-500">(128 reviews)</span>
                </div>

                {/* Events Count */}
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    <span className="font-semibold text-gray-900">
                      {event.ngo?.total_events || 0}
                    </span>{" "}
                    events organized
                  </span>
                </div>
              </div>
            </div>
          </div>
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
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        About the Organizer
      </h3>

      <div className="space-y-5">
        {/* NGO Icon and Name */}
        <div className="flex items-start gap-4">
          {event.ngo?.logo_url ? (
            <div className="flex-shrink-0">
              <Image
                src={event.ngo.logo_url}
                alt={event.ngo.name}
                width={64}
                height={64}
                className="rounded-2xl"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <Building className="h-8 w-8 text-emerald-600" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 text-lg mb-1">
              {event.ngo?.name || "Organization"}
            </h4>
            <p className="text-sm text-gray-600">
              {event.ngo?.total_events || 0} events organized
            </p>
          </div>
        </div>

        {/* Description */}
        {event.ngo?.description && (
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
            {event.ngo.description}
          </p>
        )}

        {/* Contact Information */}
        <div className="space-y-3 pt-2">
          {event.ngo?.contact_email && (
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <span className="text-sm truncate">
                {event.ngo.contact_email}
              </span>
            </div>
          )}

          {event.ngo?.contact_phone && (
            <div className="flex items-center gap-3 text-gray-700">
              <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <span className="text-sm">{event.ngo.contact_phone}</span>
            </div>
          )}
        </div>

        {/* View Profile Button */}
        <button
          onClick={() => setActiveTab("organizer")}
          className="w-full text-center text-emerald-600 hover:text-emerald-700 font-semibold text-sm py-3 hover:bg-emerald-50 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
        >
          View Full Profile
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
