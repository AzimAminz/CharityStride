"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Target, Heart, Globe, Shield } from "lucide-react";
import Footer from "../components/Footer";
import Hero3D from "../components/Hero3D"; // Reusing the 3D background for consistency

export default function AboutPageClient() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
      {/* Reused Floating Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full py-3 px-6 shadow-2xl flex items-center gap-8 w-max">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <span className="text-white font-black text-xl italic">C</span>
          </div>
          <span className="hidden sm:block text-white font-black tracking-tighter text-xl">
            CHARITY<span className="text-emerald-500">STRIDE</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/events"
            className="text-white/70 hover:text-white font-medium transition-colors text-sm"
          >
            Events
          </Link>
          <Link
            href="/about"
            className="text-white font-bold transition-colors text-sm"
          >
            About
          </Link>
        </div>
        <Link
          href="/login"
          className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
        >
          Log In
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <Hero3D />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tighter"
          >
            Innovating for <br />
            <span className="text-emerald-500">Social Good</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            We are bridging the gap between donors, volunteers, and NGOs with
            cutting-edge technology.
          </motion.p>
        </div>
      </section>

      {/* Visionary / Founder Section */}
      <section className="py-24 px-6 relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 blur-[100px] -z-10" />

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Image Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative group"
            >
              <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-gray-800 border border-white/10 relative shadow-2xl group-hover:border-emerald-500/50 transition-colors">
                <img
                  src="/azim.JPG"
                  alt="Azim Amin"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500 rounded-full blur-2xl opacity-20" />
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-[1px] bg-emerald-500" />
                <span className="text-emerald-500 font-bold uppercase tracking-widest text-sm">
                  The Visionary
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                Azim Amin
              </h2>

              <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                <p>
                  "I started CharityStride with a simple yet ambitious goal: to
                  democratize access to social impact tools. Too many NGOs
                  struggle with outdated systems, preventing them from doing
                  what they do best—helping people."
                </p>
                <p>
                  With a background in software engineering and a passion for
                  community service, Azim built CharityStride to bridge the gap
                  between compassionate hearts and meaningful causes. It serves
                  as a digital backbone for non-profits while empowering the
                  public to easily discover, volunteer, and join impact-driven
                  events across Malaysia.
                </p>
              </div>

              <div className="mt-10 pt-10 border-t border-white/10 grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-3xl font-black text-white mb-1">500+</h4>
                  <p className="text-gray-500 text-sm">NGOs Empowered</p>
                </div>
                <div>
                  <h4 className="text-3xl font-black text-white mb-1">10k+</h4>
                  <p className="text-gray-500 text-sm">Events Organized</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Grid */}
      <section className="py-24 px-6 bg-white/5 border-y border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Core Principles
            </h2>
            <div className="w-24 h-1.5 bg-emerald-500 rounded-full mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Mission-First",
                desc: "Every feature we build is designed to maximize social impact.",
              },
              {
                icon: Globe,
                title: "Accessibility",
                desc: "Making powerful tools accessible to organizations of all sizes.",
              },
              {
                icon: Shield,
                title: "Trust & Transparency",
                desc: "Building a verified and secure ecosystem for donors.",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-black/40 border border-white/10 p-8 rounded-3xl hover:border-emerald-500/50 transition-colors group"
              >
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 text-emerald-500 group-hover:text-white transition-all">
                  <item.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black mb-8">Want to talk?</h2>
          <Link
            href="mailto:azim@charitystride.com"
            className="inline-flex items-center gap-3 text-emerald-500 font-bold text-2xl hover:text-white transition-colors"
          >
            azim@charitystride.com <ArrowRight />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
