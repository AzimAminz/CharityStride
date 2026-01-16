"use client";

import { motion } from "framer-motion";
import { Users, Heart, Shield, BarChart3, Rocket, Globe } from "lucide-react";

const features = [
  {
    icon: <Users className="text-emerald-500" size={32} />,
    title: "Volunteer Management",
    desc: "Seamlessly recruit, coordinate, and track volunteer contributions across multiple roles and shifts.",
  },
  {
    icon: <Heart className="text-pink-500" size={32} />,
    title: "Donation Scaling",
    desc: "Drive impact with flexible donation modules, supporting both monetary and item-based contributions.",
  },
  {
    icon: <Shield className="text-blue-500" size={32} />,
    title: "Verified Registry",
    desc: "Secure participant registration with QR-based check-ins and verified NGO authentication.",
  },
  {
    icon: <BarChart3 className="text-amber-500" size={32} />,
    title: "Deep Analytics",
    desc: "Gain actionable insights with real-time reporting on event performance and social impact metrics.",
  },
  {
    icon: <Rocket className="text-purple-500" size={32} />,
    title: "Eco-System Scale",
    desc: "Built to handle everything from local community gatherings to national-scale charity events.",
  },
  {
    icon: <Globe className="text-emerald-400" size={32} />,
    title: "Global Reach",
    desc: "Connect with donors and volunteers worldwide through our integrated digital infrastructure.",
  },
];

export default function FeatureGrid() {
  return (
    <section className="py-24 px-6 bg-black relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black mb-6"
          >
            Powerful Tools for{" "}
            <span className="text-emerald-500">Every NGO</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 max-w-2xl mx-auto text-lg"
          >
            A comprehensive suite of features designed to simplify coordination
            and maximize social impact.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-3xl bg-[#0f0f0f] border border-white/5 hover:border-emerald-500/30 transition-all duration-500"
            >
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all duration-500">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 text-white group-hover:text-emerald-500 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
