"use client";

import { motion } from "framer-motion";

export default function MissionSection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex-1"
        >
          <span className="text-emerald-500 font-bold tracking-widest uppercase text-sm mb-4 block">
            Our Mission
          </span>
          <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
            Empowering <span className="text-emerald-500">Change</span>, One
            Stride at a Time.
          </h2>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-2xl">
            At CharityStride, we believe in the power of collective action. Our
            platform bridge the gap between passion and purpose, providing NGOs
            with the cutting-edge tools they need to organize events that
            matter.
          </p>
          <div className="flex gap-12">
            <div>
              <div className="text-3xl font-bold text-white mb-1">98%</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                NGO Retention
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">50M+</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                Total Impact
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex-1 relative aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-white/5 group"
        >
          <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-group-of-volunteers-giving-outbox-644-large.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20" />
          <div className="absolute bottom-6 left-6 z-30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
              </div>
              <span className="text-white font-bold text-sm tracking-wide uppercase">
                Watch Our Impact
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
