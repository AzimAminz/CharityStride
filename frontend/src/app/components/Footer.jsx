"use client";

import Link from "next/link";
import { Github, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black py-20 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 no-underline mb-6"
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xl italic">C</span>
              </div>
              <span className="text-white font-black tracking-tighter text-xl">
                CHARITYSTRIDE
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Building the digital infrastructure for modern social impact.
              Empowering NGOs globally to scale their vision through technology.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-500 transition-colors"
                aria-label="Github"
              >
                <Github size={18} className="text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-500 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={18} className="text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} className="text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-emerald-500 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} className="text-white" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">
              Platform
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/events"
                  className="text-gray-500 hover:text-white transition-colors text-sm"
                >
                  Explore Events
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-500 hover:text-white transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/register/ngo"
                  className="text-gray-500 hover:text-white transition-colors text-sm"
                >
                  NGO Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/impact"
                  className="text-gray-500 hover:text-white transition-colors text-sm"
                >
                  Our Impact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">
              Resources
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/help"
                  className="text-gray-500 hover:text-white transition-colors text-sm"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-gray-500 hover:text-white transition-colors text-sm"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="text-gray-500 hover:text-white transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-500 hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">
              Stay Updated
            </h4>
            <p className="text-gray-500 text-sm mb-6">
              Join our newsletter for latest updates on social impact.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="email@example.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-white"
              />
              <button className="bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs font-medium">
            &copy; {new Date().getFullYear()} CharityStride Inc. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[10px] font-bold text-gray-700 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-emerald-500/30 rounded-full" />
              Build v2.4.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
