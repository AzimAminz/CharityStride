"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AnimatedCTA() {
  return (
    <section className="py-24 px-6 bg-[#050505] relative overflow-hidden">
      <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full scale-150 -translate-y-1/2" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-2 rounded-full inline-flex items-center gap-2 mb-8"
        >
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-500 font-bold text-xs uppercase tracking-widest">
            Join the Movement
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tighter"
        >
          Ready to scale your{" "}
          <span className="text-emerald-500 italic">social impact?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto"
        >
          Join hundreds of NGOs already using CharityStride to change the world.
          Registration only takes a few minutes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link
            href="/login"
            className="group bg-white text-black px-10 py-5 rounded-2xl font-black text-lg flex items-center gap-3 hover:bg-emerald-500 hover:text-white transition-all duration-300 active:scale-95 shadow-2xl"
          >
            Start Your Mission
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/about"
            className="text-white/60 hover:text-white font-bold text-lg transition-colors border-b border-white/10 hover:border-white py-1"
          >
            Learn more about our vision
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
