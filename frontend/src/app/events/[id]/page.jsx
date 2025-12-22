"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ChevronRight,
  Heart,
  Share2,
  Bookmark,
  Building,
  Target,
  DollarSign,
  Shield,
  Award,
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  ArrowLeft,
  CheckCircle,
  Star,
  AlertCircle,
  Info,
  ExternalLink,
} from "lucide-react";
import { format, parseISO, isAfter, isBefore } from "date-fns";

export default function EventDetailsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Dummy Event Data - Replace with your actual data
  const event = {
    id: 123,
    ngo_id: 55,
    title: "Charity Run for Education 2024",
    description: `Join us for our annual charity run to support underprivileged children's education across Malaysia. This year's theme is 'Running for Brighter Futures'.

Run through the scenic Taman Tasik Titiwangsa while contributing to a noble cause. All proceeds will go towards building new classrooms and providing educational materials for children in rural areas.

This event is perfect for:
• Families looking for a fun weekend activity
• Corporate teams wanting to give back
• Fitness enthusiasts seeking a challenge
• Anyone who wants to make a difference

We've helped over 1,000 children get access to quality education through previous runs, and with your participation, we can help even more!`,
    thumbnail:
      "https://images.unsplash.com/photo-1552674605-db6ffd8facb5?w=1200&h=600&fit=crop",
    location_name: "Taman Tasik Titiwangsa, Kuala Lumpur",
    latitude: 3.179731,
    longitude: 101.705841,
    start_date: "2024-06-15",
    end_date: "2024-06-15",
    status: "published",
    has_volunteer: true,
    has_participant: true,
    has_donation: true,
    registration_status: "open",
    registration_deadline: "2024-06-10",
    early_bird_deadline: "2024-04-30",
    max_participants: 2000,
    current_participants: 1423,
    total_donations: 50000,
    volunteers_needed: 50,
    current_volunteers: 32,
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-15T14:30:00Z",

    organizer: {
      id: 55,
      ngo_name: "Education for All Foundation",
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=400&fit=crop",
      description:
        "Providing education access to underprivileged children since 2010. We've helped over 10,000 children get quality education across Malaysia.",
      contact_email: "contact@educationforall.org",
      contact_phone: "03-1234 5678",
      rating: 4.8,
      total_events: 24,
      total_reviews: 128,
      address: "123 Education Street, Kuala Lumpur",
      website: "https://educationforall.org",
      social_media: {
        facebook: "https://facebook.com/educationforall",
        instagram: "https://instagram.com/educationforall",
        twitter: "https://twitter.com/educationforall",
      },
    },

    sections: [
      {
        id: 1,
        title: "Event Highlights",
        content: `• 5KM scenic route around Taman Tasik Titiwangsa
• Live entertainment and performances throughout the route
• Free healthy breakfast for all participants
• Professional timing with chip technology
• Certificates for all finishers
• Lucky draw with amazing prizes including vacation packages
• Family-friendly activities in the kids' zone
• Health and wellness expo with free checkups`,
        images: [
          "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w-800&h=600&fit=crop",
        ],
        order: 0,
      },
      {
        id: 2,
        title: "Route Map",
        content:
          "The route starts at the Main Entrance and takes you through the beautiful lakeside paths of Taman Tasik Titiwangsa. There will be 3 water stations and 2 first aid points along the route.",
        images: [
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
        ],
        order: 1,
      },
    ],

    schedule: [
      {
        time: "06:00 AM",
        activity: "Registration Opens",
        description: "Collect your race kit and timing chip",
      },
      {
        time: "06:30 AM",
        activity: "Warm-up Session",
        description: "Group warm-up with certified trainers",
      },
      {
        time: "07:00 AM",
        activity: "Competitive Run Start",
        description: "5KM competitive run begins",
      },
      {
        time: "08:00 AM",
        activity: "Fun Run Start",
        description: "3KM fun run for families",
      },
      {
        time: "09:30 AM",
        activity: "Award Ceremony",
        description: "Prizes for top finishers",
      },
      {
        time: "10:00 AM",
        activity: "Entertainment & Expo",
        description: "Live performances and wellness expo",
      },
    ],

    rules: [
      "Participants must be at least 6 years old",
      "Medical clearance is recommended for competitive runners",
      "No pets allowed on the running route",
      "Follow all COVID-19 safety protocols if applicable",
      "Bib numbers must be visible at all times",
      "No littering - use designated trash bins",
      "Respect other participants and volunteers",
    ],

    reviews: [
      {
        id: 1,
        user_name: "Ahmad Zaki",
        rating: 5,
        comment:
          "Amazing event! Well organized and for a great cause. Will definitely join again next year.",
        created_at: "2023-12-15T10:30:00Z",
        likes: 24,
      },
      {
        id: 2,
        user_name: "Sarah Tan",
        rating: 4,
        comment:
          "Great atmosphere and beautiful route. The volunteers were very helpful. Looking forward to the next one!",
        created_at: "2023-12-10T14:20:00Z",
        likes: 18,
      },
      {
        id: 3,
        user_name: "Raj Kumar",
        rating: 5,
        comment:
          "My family had a wonderful time. The kids zone was excellent and the organization was top-notch.",
        created_at: "2023-12-05T09:15:00Z",
        likes: 32,
      },
    ],
  };

  // Dummy user registration status
  const registrationStatus = null; // Set to null to show "Register Now" buttons

  const handleRegister = (moduleType = "participant") => {
    // For now, just log and show alert
    alert(
      `Redirecting to ${moduleType} registration...\n\nIn production, this would redirect to: /events/${event.id}/register?module=${moduleType}`
    );

    // Uncomment when you have the registration page ready:
    // router.push(`/events/${event.id}/register?module=${moduleType}`);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    alert(isLiked ? "Removed from liked events" : "Added to liked events");
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    alert(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description.substring(0, 100) + "...",
        url: window.location.href,
      });
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
    setShowShareModal(false);
  };

  const isRegistrationOpen = event.registration_status === "open";
  const isEventUpcoming = isAfter(parseISO(event.end_date), new Date());
  const registrationProgress =
    (event.current_participants / event.max_participants) * 100;
  const daysUntilDeadline = Math.ceil(
    (parseISO(event.registration_deadline) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Events</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        {/* Event Banner */}
        <div className="relative h-[400px] lg:h-[500px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400" />

          {/* You can replace with actual image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Floating Action Buttons */}
          <div className="absolute top-6 right-6 flex gap-3 z-10">
            <button
              onClick={handleLike}
              className={`p-3 rounded-full backdrop-blur-sm border ${
                isLiked
                  ? "bg-red-500/10 border-red-500/30 text-red-500"
                  : "bg-white/10 border-white/30 text-white hover:bg-white/20"
              } transition-colors`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            </button>

            <button
              onClick={handleBookmark}
              className={`p-3 rounded-full backdrop-blur-sm border ${
                isBookmarked
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                  : "bg-white/10 border-white/30 text-white hover:bg-white/20"
              } transition-colors`}
            >
              <Bookmark
                className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`}
              />
            </button>

            <button
              onClick={handleShare}
              className="p-3 rounded-full backdrop-blur-sm bg-white/10 border border-white/30 text-white hover:bg-white/20 transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Event Info Card */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              {/* Left: Event Info */}
              <div className="flex-1">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 text-sm font-semibold">
                    Published
                  </span>

                  {isRegistrationOpen && (
                    <span className="px-4 py-1.5 rounded-full bg-green-100 text-green-700 border border-green-200 text-sm font-semibold">
                      Registration Open
                    </span>
                  )}

                  <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-sm font-semibold">
                    🎁 Early Bird Available
                  </span>

                  {daysUntilDeadline <= 7 && (
                    <span className="px-4 py-1.5 rounded-full bg-red-100 text-red-700 border border-red-200 text-sm font-semibold">
                      ⏰ Closing Soon
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {event.title}
                </h1>

                {/* Organizer */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-100 bg-emerald-50 flex items-center justify-center">
                    <Building className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Organized by</p>
                    <p className="font-semibold text-gray-800">
                      {event.organizer.ngo_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Star className="h-4 w-4 text-amber-500 fill-current" />
                    <span className="font-semibold text-gray-700">
                      {event.organizer.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({event.organizer.total_events} events)
                    </span>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <InfoCard
                    icon={<Calendar className="h-5 w-5" />}
                    label="Date"
                    value={format(parseISO(event.start_date), "dd MMM yyyy")}
                  />
                  <InfoCard
                    icon={<MapPin className="h-5 w-5" />}
                    label="Location"
                    value={event.location_name}
                  />
                  <InfoCard
                    icon={<Users className="h-5 w-5" />}
                    label="Participants"
                    value={`${event.current_participants.toLocaleString()}/${event.max_participants.toLocaleString()}`}
                  />
                  <InfoCard
                    icon={<Clock className="h-5 w-5" />}
                    label="Registration Closes"
                    value={format(
                      parseISO(event.registration_deadline),
                      "dd MMM yyyy"
                    )}
                  />
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Registration Progress</span>
                    <span>{Math.round(registrationProgress)}% Filled</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${registrationProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Right: Action Card */}
              <div className="lg:w-96">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4"></h3>

                  {/* Registration Status */}
                  {registrationStatus ? (
                    <div className="mb-6 p-4 bg-white rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-emerald-500" />
                        <div>
                          <p className="font-semibold text-gray-800">
                            Already Registered
                          </p>
                          <p className="text-sm text-gray-600">
                            Competitive Run • Confirmed
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => alert("View registration details")}
                        className="mt-3 w-full text-center text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                      >
                        View Registration Details →
                      </button>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="flex items-center gap-3">
                        <Info className="h-6 w-6 text-amber-600" />
                        <div>
                          <p className="font-semibold text-gray-800">
                            Not Registered Yet
                          </p>
                          <p className="text-sm text-gray-600">
                            Choose how you want to participate below
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Available Modules */}
                  <div className="space-y-4 mb-6">
                    {event.has_participant && (
                      <ModuleCard
                        icon={<Users className="h-5 w-5" />}
                        title="Join as Participant"
                        description="Register to run/walk in the event"
                        onClick={() => handleRegister("participant")}
                        disabled={!isRegistrationOpen}
                      />
                    )}

                    {event.has_volunteer && (
                      <ModuleCard
                        icon={<Heart className="h-5 w-5" />}
                        title="Volunteer"
                        description="Help organize and run the event"
                        onClick={() => handleRegister("volunteer")}
                        disabled={!isRegistrationOpen}
                      />
                    )}

                    {event.has_donation && (
                      <ModuleCard
                        icon={<DollarSign className="h-5 w-5" />}
                        title="Make a Donation"
                        description="Support the cause financially"
                        onClick={() => handleRegister("donation")}
                      />
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <StatCard
                        value={event.current_participants}
                        label="Participants"
                      />
                      <StatCard
                        value={event.total_donations}
                        label="Donations"
                        prefix="RM"
                      />
                      <StatCard
                        value={
                          event.volunteers_needed - event.current_volunteers
                        }
                        label="Volunteers Needed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {["overview", "details", "organizer", "faq", "reviews"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              )
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (2/3) */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Description */}
                  <Section title="About This Event">
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {event.description}
                      </p>
                    </div>
                  </Section>

                  {/* Event Sections */}
                  {event.sections.map((section, index) => (
                    <Section key={section.id} title={section.title}>
                      <div className="space-y-4">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {section.content}
                        </p>
                        {/* Image Placeholders */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          {section.images?.slice(0, 2).map((img, idx) => (
                            <div
                              key={idx}
                              className="relative h-48 rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-br from-emerald-50 to-teal-50"
                            >
                              <Image
                                src={img}
                                alt={`${section.title} image ${idx + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </Section>
                  ))}

                  {/* What You'll Get */}
                  <Section title="What You'll Get">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <PerkCard
                        icon={<Award className="h-5 w-5" />}
                        title="Certificate"
                        description="Digital certificate of participation"
                      />
                      <PerkCard
                        icon={<Shield className="h-5 w-5" />}
                        title="Insurance Coverage"
                        description="Event insurance for all participants"
                      />
                      <PerkCard
                        icon={<Target className="h-5 w-5" />}
                        title="Goodie Bag"
                        description="Event merchandise and sponsors' items"
                      />
                      <PerkCard
                        icon={<Users className="h-5 w-5" />}
                        title="Networking"
                        description="Connect with like-minded individuals"
                      />
                    </div>
                  </Section>
                </motion.div>
              )}

              {activeTab === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Schedule */}
                  <Section title="Event Schedule">
                    <div className="space-y-4">
                      {event.schedule.map((item, index) => (
                        <ScheduleItem
                          key={index}
                          time={item.time}
                          activity={item.activity}
                          description={item.description}
                          isLast={index === event.schedule.length - 1}
                        />
                      ))}
                    </div>
                  </Section>

                  {/* Location Details */}
                  <Section title="Location Details">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {event.location_name}
                          </p>
                          <p className="text-gray-600">
                            Taman Tasik Titiwangsa, 50500 Kuala Lumpur
                          </p>
                          <div className="mt-2 space-y-1 text-sm text-gray-500">
                            <p>• Ample parking available (P1 & P2)</p>
                            <p>• Near Titiwangsa LRT & Monorail stations</p>
                            <p>• Wheelchair accessible</p>
                            <p>• Restrooms and changing facilities available</p>
                          </div>
                        </div>
                      </div>

                      {/* Map Placeholder */}
                      <div className="h-64 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                          <p className="text-gray-700 font-medium">
                            {event.location_name}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Interactive map available after registration
                          </p>
                          <button className="mt-3 px-4 py-2 bg-white border border-emerald-300 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors text-sm">
                            View on Google Maps
                          </button>
                        </div>
                      </div>
                    </div>
                  </Section>

                  {/* Rules & Regulations */}
                  <Section title="Rules & Regulations">
                    <div className="space-y-3">
                      {event.rules.map((rule, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                          <p className="text-gray-700">{rule}</p>
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* What to Bring */}
                  <Section title="What to Bring">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { item: "Running Shoes", icon: "👟" },
                        { item: "Water Bottle", icon: "💧" },
                        { item: "Sun Protection", icon: "☀️" },
                        { item: "Extra Clothes", icon: "👕" },
                        { item: "ID Card", icon: "🪪" },
                        { item: "Positive Energy", icon: "✨" },
                        { item: "Rain Gear", icon: "🌧️" },
                        { item: "Smartphone", icon: "📱" },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 rounded-xl text-center"
                        >
                          <div className="text-2xl mb-2">{item.icon}</div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Section>
                </motion.div>
              )}

              {activeTab === "organizer" && (
                <OrganizerTab organizer={event.organizer} />
              )}
              {activeTab === "reviews" && (
                <ReviewsTab reviews={event.reviews} />
              )}
              {activeTab === "faq" && <FAQTab />}
            </AnimatePresence>
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-8">
            {/* Organizer Quick Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                About the Organizer
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-100 bg-emerald-50 flex items-center justify-center">
                    <Building className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {event.organizer.ngo_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {event.organizer.total_events} events organized
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 text-sm">
                  {event.organizer.description.substring(0, 150)}...
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {event.organizer.contact_email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {event.organizer.contact_phone}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("organizer")}
                  className="w-full text-center text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                >
                  View Full Profile →
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Event Statistics
              </h3>
              <div className="space-y-4">
                <StatItem
                  label="Total Participants"
                  value={event.current_participants}
                  max={event.max_participants}
                  color="emerald"
                />
                <StatItem
                  label="Volunteers Registered"
                  value={event.current_volunteers}
                  max={event.volunteers_needed}
                  color="blue"
                />
                <StatItem
                  label="Funds Raised"
                  value={event.total_donations}
                  prefix="RM"
                  color="purple"
                />
                <StatItem
                  label="Days Left to Register"
                  value={daysUntilDeadline}
                  color="amber"
                />
              </div>
            </div>

            {/* Social Share */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Share This Event
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: <Facebook className="h-5 w-5" />,
                    color: "bg-blue-500 hover:bg-blue-600",
                    label: "Facebook",
                  },
                  {
                    icon: <Twitter className="h-5 w-5" />,
                    color: "bg-sky-500 hover:bg-sky-600",
                    label: "Twitter",
                  },
                  {
                    icon: <Instagram className="h-5 w-5" />,
                    color: "bg-pink-500 hover:bg-pink-600",
                    label: "Instagram",
                  },
                  {
                    icon: <Globe className="h-5 w-5" />,
                    color: "bg-gray-700 hover:bg-gray-800",
                    label: "Copy Link",
                  },
                ].map((social) => (
                  <button
                    key={social.label}
                    onClick={() =>
                      social.label === "Copy Link"
                        ? copyToClipboard()
                        : handleShare()
                    }
                    className={`flex flex-col items-center justify-center p-4 rounded-xl text-white ${social.color} transition-all hover:scale-105`}
                  >
                    {social.icon}
                    <span className="text-xs mt-2 font-medium">
                      {social.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Need Help? */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Need Help?
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => alert("Opening registration guide...")}
                  className="w-full text-left p-3 rounded-lg bg-white border border-blue-200 hover:border-blue-300 transition-colors"
                >
                  <p className="font-medium text-gray-900">
                    Registration Process
                  </p>
                  <p className="text-sm text-gray-600">Step-by-step guide</p>
                </button>
                <button
                  onClick={() => alert("Showing payment methods...")}
                  className="w-full text-left p-3 rounded-lg bg-white border border-blue-200 hover:border-blue-300 transition-colors"
                >
                  <p className="font-medium text-gray-900">Payment Methods</p>
                  <p className="text-sm text-gray-600">
                    Accepted payment options
                  </p>
                </button>
                <button
                  onClick={() => setActiveTab("faq")}
                  className="w-full text-left p-3 rounded-lg bg-white border border-blue-200 hover:border-blue-300 transition-colors"
                >
                  <p className="font-medium text-gray-900">FAQ</p>
                  <p className="text-sm text-gray-600">
                    Common questions answered
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowShareModal(false)}
          />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Share Event
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                readOnly
                value={
                  typeof window !== "undefined" ? window.location.href : ""
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
const InfoCard = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
    <div className="p-2 rounded-lg bg-white border border-gray-300">
      <div className="text-gray-600">{icon}</div>
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const ModuleCard = ({ icon, title, description, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full text-left p-4 rounded-xl border transition-all ${
      disabled
        ? "bg-gray-100 border-gray-300 cursor-not-allowed"
        : "bg-white border-gray-300 hover:border-emerald-300 hover:shadow-lg"
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            disabled ? "bg-gray-200" : "bg-emerald-100"
          }`}
        >
          <div className={disabled ? "text-gray-400" : "text-emerald-600"}>
            {icon}
          </div>
        </div>
        <div>
          <p
            className={`font-semibold ${
              disabled ? "text-gray-500" : "text-gray-900"
            }`}
          >
            {title}
          </p>
          <p
            className={`text-sm ${
              disabled ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {description}
          </p>
        </div>
      </div>
      <ChevronRight
        className={`h-5 w-5 ${disabled ? "text-gray-400" : "text-gray-400"}`}
      />
    </div>
  </button>
);

const StatCard = ({ value, label, prefix = "" }) => (
  <div className="text-center">
    <p className="text-2xl font-bold text-gray-900">
      {prefix}
      {typeof value === "number" ? value.toLocaleString() : value}
    </p>
    <p className="text-xs text-gray-500 mt-1">{label}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
    {children}
  </div>
);

const PerkCard = ({ icon, title, description }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
    <div className="p-2 rounded-lg bg-white border border-gray-300">
      <div className="text-emerald-600">{icon}</div>
    </div>
    <div>
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

const ScheduleItem = ({ time, activity, description, isLast }) => (
  <div className="flex">
    <div className="flex flex-col items-center mr-6">
      <div className="w-12 h-12 rounded-full bg-emerald-100 border-4 border-white flex items-center justify-center">
        <Clock className="h-5 w-5 text-emerald-600" />
      </div>
      {!isLast && <div className="w-0.5 h-full bg-emerald-200 mt-2" />}
    </div>
    <div className="pb-6 flex-1">
      <p className="font-semibold text-gray-900">{time}</p>
      <p className="text-lg font-bold text-gray-900 mb-1">{activity}</p>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

const StatItem = ({ label, value, max, prefix = "", color = "gray" }) => {
  const percentage = max ? (value / max) * 100 : 0;
  const colorClasses = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    amber: "bg-amber-500",
    gray: "bg-gray-500",
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">
          {prefix}
          {typeof value === "number" ? value.toLocaleString() : value}
          {max ? `/${max.toLocaleString()}` : ""}
        </span>
      </div>
      {max && (
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClasses[color]} rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
};

// Organizer Tab Component
const OrganizerTab = ({ organizer }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-8"
  >
    {/* Organizer Header */}
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-emerald-100 flex items-center justify-center">
          <Building className="h-12 w-12 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {organizer.ngo_name}
          </h2>
          <p className="text-gray-600 mb-4">{organizer.description}</p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(organizer.rating)
                        ? "text-amber-500 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-gray-900">
                {organizer.rating.toFixed(1)}
              </span>
              <span className="text-gray-500">
                ({organizer.total_reviews} reviews)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {organizer.total_events} events organized
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Contact Information */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 bg-white border border-gray-200 rounded-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Contact Information
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">
                {organizer.contact_email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">
                {organizer.contact_phone}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium text-gray-900">{organizer.address}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Social Media</h3>
        <div className="space-y-3">
          {organizer.social_media.facebook && (
            <a
              href={organizer.social_media.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Facebook className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">Facebook</span>
              <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
            </a>
          )}
          {organizer.social_media.instagram && (
            <a
              href={organizer.social_media.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-pink-50 border border-pink-200 rounded-lg hover:bg-pink-100 transition-colors"
            >
              <Instagram className="h-5 w-5 text-pink-600" />
              <span className="font-medium text-gray-900">Instagram</span>
              <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
            </a>
          )}
          {organizer.social_media.twitter && (
            <a
              href={organizer.social_media.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors"
            >
              <Twitter className="h-5 w-5 text-sky-600" />
              <span className="font-medium text-gray-900">Twitter</span>
              <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
            </a>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

// Reviews Tab Component
const ReviewsTab = ({ reviews }) => {
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Rating Summary */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.floor(averageRating)
                      ? "text-amber-500 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-600">{reviews.length} reviews</p>
          </div>

          {/* Reviews List */}
          <div className="flex-1 space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 bg-white rounded-xl border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="font-semibold text-emerald-600">
                      {review.user_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {review.user_name}
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? "text-amber-500 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-sm text-gray-500">
                    {format(parseISO(review.created_at), "dd MMM yyyy")}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Write Review Button */}
      <div className="text-center">
        <button
          onClick={() => alert("Feature coming soon!")}
          className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
        >
          Write a Review
        </button>
      </div>
    </motion.div>
  );
};

// FAQ Tab Component
const FAQTab = () => {
  const faqs = [
    {
      question: "What is included in the registration fee?",
      answer:
        "Registration includes event participation, event t-shirt, timing chip (for competitive run), certificate, goodie bag, and post-event meal.",
    },
    {
      question: "Can I get a refund if I can't attend?",
      answer:
        "Full refunds are available up to 30 days before the event. After that, 50% refund until 7 days before. No refunds within 7 days of the event.",
    },
    {
      question: "Is there parking available?",
      answer:
        "Yes, ample parking is available at P1 and P2 parking lots near Taman Tasik Titiwangsa. Parking fee is RM5 per entry.",
    },
    {
      question: "Can I transfer my registration to someone else?",
      answer:
        "Yes, you can transfer your registration to another person up to 7 days before the event. Contact our support team for assistance.",
    },
    {
      question: "What happens if it rains?",
      answer:
        "The event will proceed rain or shine unless there are severe weather conditions. Please bring appropriate rain gear.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">
                  {faq.question}
                </span>
                <ChevronRight
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    openIndex === index ? "rotate-90" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="p-4 pt-0">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-600 mb-4">Still have questions?</p>
        <button
          onClick={() => alert("Contacting support...")}
          className="px-6 py-2 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-semibold"
        >
          Contact Support
        </button>
      </div>
    </motion.div>
  );
};
