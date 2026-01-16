"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./Landing.css";
import { getPlatformStats } from "./lib/api/publicEventsApi";
import Hero3D from "./components/Hero3D";
import MissionSection from "./components/MissionSection";
import FeatureGrid from "./components/FeatureGrid";
import AnimatedCTA from "./components/AnimatedCTA";
import Footer from "./components/Footer";

export default function HomePage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPlatformStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch platform stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="landing-container">
      {/* 3D Hero Section */}
      <section className="hero-section relative h-screen overflow-hidden flex items-center justify-center">
        <Hero3D />
        <div className="hero-overlay" />

        {/* Floating Pill Navigation */}
        <nav className="floating-nav">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <span className="text-white font-black text-xl italic">C</span>
            </div>
            <span className="text-white font-black tracking-tighter text-xl">
              CHARITY<span className="text-emerald-500">STRIDE</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/events" className="nav-link">
              Events
            </Link>
            <Link href="/about" className="nav-link">
              About
            </Link>
          </div>
          <Link href="/login" className="nav-cta">
            Log In
          </Link>
        </nav>

        {/* Central Hero Content */}
        <div className="hero-content relative z-20">
          <h1 className="hero-title">
            Make Every <br /> Stride Count
          </h1>
          <p className="hero-subtitle">
            The all-in-one platform for NGOs to organize, manage, and scale
            their social impact through seamless event coordination.
          </p>
          <div className="hero-btns text-center w-full flex justify-center mt-8">
            <Link href="/events" className="btn-primary">
              Explore Events
            </Link>
          </div>
        </div>

        {/* Hero Bottom Stats */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-7xl px-6 flex justify-between items-end z-20 border-t border-white/5 pt-8">
          <div className="flex gap-12 md:gap-24">
            <div className="stat-item">
              <span className="stat-value">
                {stats?.formatted?.active_events || "0"}
              </span>
              <span className="stat-label">Active Events</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {stats?.formatted?.volunteers || "0"}
              </span>
              <span className="stat-label">Volunteers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {stats?.formatted?.funds_raised || "RM 0"}
              </span>
              <span className="stat-label">Funds Raised</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-3 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-white/60 text-xs font-bold tracking-widest uppercase">
              Live Impact Tracking
            </span>
          </div>
        </div>
      </section>

      {/* Expanded Sections */}
      <MissionSection />
      <FeatureGrid />
      <AnimatedCTA />

      <AnimatedCTA />

      {/* Professional Footer */}
      <Footer />
    </div>
  );
}
