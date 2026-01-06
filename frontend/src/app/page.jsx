"use client";

import Link from "next/link";
import "./Landing.css";

export default function HomePage() {
  return (
    <div className="landing-container">
      {/* Background with Generated 3D Image */}
      <img
        src="/assets/landing-hero.png"
        alt="CharityStride 3D Background"
        className="hero-bg"
      />
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
            Impact
          </Link>
          <Link href="/about" className="nav-link">
            About
          </Link>
        </div>
        <Link href="/login" className="nav-cta">
          Join Now
        </Link>
      </nav>

      {/* Central Hero Content */}
      <section className="hero-content">
        <h1 className="hero-title">
          Make Every <br /> Stride Count
        </h1>
        <p className="hero-subtitle">
          The all-in-one platform for NGOs to organize, manage, and scale their
          social impact through seamless event coordination.
        </p>
        <div className="hero-btns">
          <Link href="/events" className="btn-primary">
            Explore Events
          </Link>
          <Link href="/register/ngo" className="btn-secondary">
            Register NGO
          </Link>
        </div>
      </section>

      {/* Decorative Footer Stats */}
      <footer className="footer-stats">
        <div className="stat-group">
          <div className="stat-item">
            <span className="stat-value">500+</span>
            <span className="stat-label">Active Events</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">12K+</span>
            <span className="stat-label">Volunteers</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">RM 2.4M</span>
            <span className="stat-label">Funds Raised</span>
          </div>
        </div>

        <div className="status-indicator">
          <div className="status-dot" />
          <span className="status-text">Platform Live • 24/7 Impact</span>
        </div>
      </footer>
    </div>
  );
}
