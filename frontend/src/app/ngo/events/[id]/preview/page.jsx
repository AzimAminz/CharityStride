"use client";

import { useEventDetail } from "../../../../hooks/useEventDetail";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Heart,
  Trophy,
  Edit,
  Eye,
  Package,
  Shirt,
  Award,
  CheckCircle2,
  ChevronDown,
  Info,
  Share2,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import Link from "next/link";

/**
 * Premium Minimalist Event Preview Page
 * "The Art Gallery" Aesthetic - Clean, spacious, focus on content and typography
 */
export default function EventPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const { event, loading, error } = useEventDetail(id);
  const [activeModule, setActiveModule] = useState(null); // null by default, interactions only
  const [isMobile, setIsMobile] = useState(false);
  const interactionSectionRef = useRef(null);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll to interaction section when module is activated
  useEffect(() => {
    if (activeModule && interactionSectionRef.current) {
      setTimeout(() => {
        interactionSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [activeModule]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="h-12 w-12 rounded-full border-2 border-gray-100 border-t-black animate-spin" />
          <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
            Curating Experience
          </p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md space-y-6">
          <div className="inline-flex p-4 rounded-full bg-gray-50 mb-4">
            <Info className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-3xl font-light text-gray-900 tracking-tight">
            Event Not Found
          </h2>
          <p className="text-gray-500 font-light leading-relaxed">
            {error || "We couldn't locate the event you're looking for."}
          </p>
          <Link
            href="/ngo/events"
            className="inline-flex items-center justify-center px-8 py-3 bg-black text-white hover:bg-gray-800 transition-all rounded-full text-sm font-medium tracking-wide"
          >
            Return to Gallery
          </Link>
        </div>
      </div>
    );
  }

  const moduleOptions = [
    {
      id: "volunteer",
      label: "Volunteer",
      description: "Join the team",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      available: event.has_volunteer,
    },
    {
      id: "participant",
      label: "Participate",
      description: "Book your slot",
      icon: Trophy,
      color: "bg-purple-50 text-purple-600",
      available: event.has_participant,
    },
    {
      id: "donation",
      label: "Donate",
      description: "Support the cause",
      icon: Heart,
      color: "bg-rose-50 text-rose-600",
      available: event.has_donation,
    },
  ].filter((opt) => opt.available);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
      {/* 1. ELEGANT PREVIEW BANNER (Floating) */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-md rounded-full text-white shadow-2xl transition-all hover:bg-black group">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
        <span className="text-xs font-medium tracking-wide pr-2 border-r border-white/20">
          PREVIEW MODE
        </span>
        <Link
          href={`/ngo/events/${id}/edit`}
          className="text-xs font-semibold hover:text-gray-300 transition-colors pl-1 flex items-center gap-1"
        >
          <Edit className="h-3 w-3" /> Edit
        </Link>
      </div>

      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
          {/* 2. LEFT IMMERSIVE CONTENT (7 cols) */}
          <div className="lg:col-span-8 p-8 lg:p-16 xl:p-24 pb-32 lg:pb-24 relative">
            {/* Minimal Header */}
            <header className="mb-16 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 border border-gray-200 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">
                  {new Date(event.start_date).getFullYear()}
                </span>
                <span className="px-3 py-1 bg-black text-white rounded-full text-[10px] font-bold tracking-[0.2em] uppercase">
                  {event.status}
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-gray-900 leading-[1.05]">
                {event.title}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center gap-6 text-gray-500 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-3 group">
                  <div className="p-2 bg-gray-50 rounded-full group-hover:bg-black group-hover:text-white transition-colors duration-300">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-wider uppercase mb-0.5">
                      Date
                    </p>
                    <p className="text-gray-900 font-medium">
                      {new Date(event.start_date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        weekday: "long",
                      })}
                    </p>
                  </div>
                </div>
                {/* Decorative separator */}
                <div className="hidden sm:block w-px h-10 bg-gray-100"></div>
                {/* Add Location if available */}
                <div className="flex items-center gap-3 group">
                  <div className="p-2 bg-gray-50 rounded-full group-hover:bg-black group-hover:text-white transition-colors duration-300">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-wider uppercase mb-0.5">
                      Location
                    </p>
                    <p className="text-gray-900 font-medium">
                      {event.location_name || "See details below"}
                    </p>
                  </div>
                </div>
              </div>
            </header>

            {/* Cinematic Hero Image */}
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl bg-gray-100 mb-16 group shadow-sm animate-in zoom-in-95 duration-1000 delay-200 fill-mode-both">
              {event.thumbnail ? (
                <>
                  <img
                    src={event.thumbnail}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 font-light tracking-widest text-sm uppercase">
                      No Imagery Provided
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* DYNAMIC INTERACTION ZONE (Appears when active) */}
            {activeModule && (
              <div
                ref={interactionSectionRef}
                className="mb-24 scroll-mt-24 animate-in fade-in slide-in-from-bottom-8 duration-500"
              >
                <div className="relative bg-white border border-gray-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-8 lg:p-12 overflow-hidden">
                  {/* Decorative Background Blob */}
                  <div
                    className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br opacity-5 rounded-bl-full pointer-events-none 
                    ${
                      activeModule === "volunteer"
                        ? "from-blue-400 to-blue-600"
                        : activeModule === "participant"
                        ? "from-purple-400 to-purple-600"
                        : "from-rose-400 to-rose-600"
                    }`}
                  />

                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
                        Active Session
                      </p>
                      <h2 className="text-3xl font-light text-gray-900">
                        {activeModule === "volunteer" &&
                          "Volunteer Application"}
                        {activeModule === "participant" &&
                          "Participant Registration"}
                        {activeModule === "donation" && "Make a Donation"}
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveModule(null)}
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors group"
                      title="Close"
                    >
                      <X className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" />
                    </button>
                  </div>

                  <div className="py-4">
                    {activeModule === "volunteer" && (
                      <VolunteerView event={event} />
                    )}
                    {activeModule === "participant" && (
                      <ParticipantView event={event} />
                    )}
                    {activeModule === "donation" && (
                      <DonationView event={event} />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PERMANENT EVENT NARRATIVE (Always Visible) */}
            <EventDetailsView
              event={event}
              hasActiveInteraction={!!activeModule}
            />
          </div>

          {/* 3. RIGHT PREMIUM SIDEBAR (5 cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-0 lg:h-screen bg-white/80 backdrop-blur-2xl border-l border-white/50 flex flex-col p-8 lg:p-12 xl:p-16 fixed bottom-0 left-0 right-0 z-40 lg:relative shadow-2xl lg:shadow-none transition-all duration-300">
            <div className="my-auto space-y-10 max-w-sm mx-auto w-full">
              {moduleOptions.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 uppercase tracking-[0.2em] mb-6">
                    Experience Menu
                  </h3>

                  {/* Custom Elegant Selector UI */}
                  <div className="space-y-4">
                    {moduleOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() =>
                          setActiveModule((prev) =>
                            prev === opt.id ? null : opt.id
                          )
                        }
                        className={`w-full group relative flex items-center gap-5 p-5 rounded-3xl border transition-all duration-500 text-left ${
                          activeModule === opt.id
                            ? "bg-white border-transparent shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] scale-100"
                            : "bg-transparent border-transparent hover:bg-white/60 hover:border-gray-100 hover:shadow-lg opacity-70 hover:opacity-100 scale-95 hover:scale-100"
                        }`}
                      >
                        <span
                          className={`p-4 rounded-2xl transition-all duration-500 shadow-sm ${
                            activeModule === opt.id
                              ? opt.color
                              : "bg-white text-gray-400 group-hover:text-gray-900 group-hover:bg-gray-50"
                          }`}
                        >
                          <opt.icon className="h-6 w-6" />
                        </span>
                        <div className="flex-1">
                          <p
                            className={`font-semibold text-base mb-1 transition-colors ${
                              activeModule === opt.id
                                ? "text-gray-900"
                                : "text-gray-600 group-hover:text-gray-900"
                            }`}
                          >
                            {opt.label}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase group-hover:text-gray-500 transition-colors">
                            {opt.description}
                          </p>
                        </div>

                        {/* Status Indicator */}
                        <div
                          className={`h-2 w-2 rounded-full transition-all duration-500 ${
                            activeModule === opt.id
                              ? "bg-black scale-100"
                              : "bg-gray-200 scale-0 group-hover:scale-100"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200 text-center">
                  <p className="text-sm font-medium text-gray-400 italic">
                    "Information Display Only"
                  </p>
                </div>
              )}

              {/* Context Info Box */}
              <div
                className={`transition-all duration-700 delay-100 ${
                  activeModule
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                {activeModule && (
                  <div className="bg-gradient-to-b from-white/80 to-white/40 p-8 rounded-[2rem] border border-white shadow-xl backdrop-blur-sm">
                    <ContextDescription
                      activeModule={activeModule}
                      event={event}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer Credit */}
            <div className="mt-auto pt-8 border-t border-gray-100/50 text-center lg:text-left">
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-300 uppercase">
                Powered by CharityStride
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- REFINED SUB-VIEWS ---

function EventDetailsView({ event, hasActiveInteraction }) {
  return (
    <div
      className={`space-y-20 max-w-4xl transition-opacity duration-700 ${
        hasActiveInteraction ? "opacity-40 hover:opacity-100" : "opacity-100"
      }`}
    >
      <section>
        <SectionTitle>The Narrative</SectionTitle>
        <div className="prose prose-xl prose-gray max-w-none">
          <p className="text-gray-600 leading-[1.8] font-light text-justify whitespace-pre-wrap">
            {event.description}
          </p>
        </div>
      </section>

      {event.sections?.map((section) => (
        <section key={section.id} className="group">
          <SectionTitle>{section.title}</SectionTitle>
          <div className="bg-gray-50/50 p-10 rounded-[2.5rem] transition-all hover:bg-gray-50 mb-8 border border-transparent hover:border-gray-100">
            <p className="text-gray-600 text-lg leading-relaxed mb-10 font-light">
              {section.content}
            </p>
            {section.images?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {section.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-2xl shadow-sm relative aspect-[4/3] group/img"
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover transform group-hover/img:scale-110 transition-transform duration-[1.5s]"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors duration-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function VolunteerView({ event }) {
  const roles = event.volunteer_roles || [];

  if (roles.length === 0)
    return (
      <EmptyState
        title="Positions Filled"
        sub="Check back later for openings"
      />
    );

  return (
    <div className="grid gap-6">
      {roles.map((role) => (
        <div
          key={role.id}
          className="group relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-blue-200 transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {role.role_name}
              </h3>
              <p className="text-gray-500 font-light text-sm leading-relaxed max-w-xl">
                {role.description}
              </p>
            </div>
            <span className="shrink-0 px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full tracking-wide uppercase">
              {role.shifts?.length || 0} Shift Options
            </span>
          </div>

          <div className="space-y-3">
            {role.shifts?.map((shift) => (
              <div
                key={shift.id}
                className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-blue-50/30 transition-colors group/shift"
              >
                <div className="flex items-center gap-4 text-sm max-w-full overflow-hidden">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">
                      {new Date(shift.shift_date).toLocaleDateString("en-US", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <span className="text-xs text-gray-500">
                      {shift.start_time} - {shift.end_time}
                    </span>
                  </div>
                </div>
                <button className="ml-4 px-6 py-2 bg-white border border-gray-200 text-gray-900 text-xs font-bold rounded-xl shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ParticipantView({ event }) {
  const categories = event.participant_categories || [];

  if (categories.length === 0)
    return (
      <EmptyState title="Registration Closed" sub="Event capacity reached" />
    );

  return (
    <div className="grid gap-6">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="group relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-purple-200 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {cat.category_name}
              </h3>
              <div className="flex gap-2">
                {cat.has_event_tshirt && (
                  <Badge icon={Shirt} label="Tee" color="blue" />
                )}
                {cat.has_finisher_tshirt && (
                  <Badge icon={Award} label="Finisher" color="orange" />
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="block text-2xl font-bold text-gray-900">
                {cat.has_fee ? `RM ${(cat.base_fee / 100).toFixed(0)}` : "Free"}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Entry Fee
              </span>
            </div>
          </div>

          <p className="text-gray-500 font-light text-sm leading-relaxed mb-6">
            {cat.description}
          </p>

          <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm tracking-wide uppercase hover:bg-purple-600 transition-colors">
            Register for {cat.category_name}
          </button>
        </div>
      ))}
    </div>
  );
}

function DonationView({ event }) {
  return (
    <div className="space-y-10">
      {event.money_donation_options?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {event.money_donation_options.map((opt) => (
            <button
              key={opt.id}
              className="group relative p-6 bg-white border border-gray-200 rounded-3xl hover:border-rose-400 hover:shadow-lg transition-all text-left flex flex-col justify-between min-h-[160px]"
            >
              <div>
                <span className="block text-3xl font-light text-gray-900 mb-2">
                  <span className="text-lg font-bold text-gray-300 mr-1">
                    RM
                  </span>
                  {(opt.suggested_amount / 100).toFixed(0)}
                </span>
                <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">
                  {opt.description || "Support"}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-rose-500 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                Donate <ArrowRight className="h-3 w-3" />
              </div>
            </button>
          ))}
          <button className="p-6 border border-dashed border-gray-300 rounded-3xl hover:border-gray-500 hover:bg-gray-50 transition-all flex flex-col items-center justify-center text-center">
            <Heart className="h-6 w-6 text-gray-300 mb-2" />
            <span className="text-sm font-bold text-gray-900">
              Custom Amount
            </span>
          </button>
        </div>
      )}

      {event.item_donation_options?.length > 0 && (
        <div className="pt-6 border-t border-gray-100">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
            Item Wishlist
          </h4>
          <div className="space-y-3">
            {event.item_donation_options.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-rose-100 hover:bg-rose-50/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl text-rose-400">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {item.item_name}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase">
                      {item.category}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white text-gray-600 rounded-lg text-xs font-bold shadow-sm">
                  Goal: {item.target_quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- PREMIUM UTILS ---

function HeaderSection({ icon: Icon, title, subtitle, color }) {
  return (
    <div className="flex flex-col items-start gap-4 mb-8">
      <div className={`p-4 rounded-2xl ${color} shadow-lg shadow-current/20`}>
        <Icon className="h-8 w-8 text-white" />
      </div>
      <div>
        <h2 className="text-4xl font-light text-gray-900 tracking-tight mb-2">
          {title}
        </h2>
        <p className="text-xl text-gray-500 font-light">{subtitle}</p>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 uppercase tracking-[0.2em] mb-8">
      {children}
    </h3>
  );
}

function ContextDescription({ activeModule, event }) {
  if (!activeModule) return null;

  const content = {
    volunteer: {
      title: "Impact Team",
      text: "Be the hands and feet of our mission. Sign up for a shift.",
    },
    participant: {
      title: "Join The Event",
      text: "Secure your place and be part of the experience.",
    },
    donation: {
      title: "Philanthropy",
      text: "Your generosity fuels our logistics and outreach efforts.",
    },
  }[activeModule];

  if (!content) return null;

  return (
    <div>
      <p className="text-sm font-bold text-gray-900 mb-2">{content.title}</p>
      <p className="text-xs text-gray-500 leading-relaxed font-medium">
        {content.text}
      </p>
    </div>
  );
}

function Badge({ icon: Icon, label, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    orange: "bg-orange-50 text-orange-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
        colors[color] || "bg-gray-100 text-gray-700"
      }`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function EmptyState({ title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
      <p className="text-lg font-medium text-gray-900 mb-1">{title}</p>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
        {sub}
      </p>
    </div>
  );
}
