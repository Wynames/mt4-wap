// file: web-generator/src/app/page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Code2, Zap, Smartphone } from "lucide-react";

const fadeUpStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUpChild = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Subtle background glow for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black opacity-90 pointer-events-none" />

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUpStagger}
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <motion.h1
            variants={fadeUpChild}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-tight"
          >
            Ubah Website Menjadi Aplikasi Android dalam Hitungan Menit
          </motion.h1>
          <motion.p
            variants={fadeUpChild}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Platform premium untuk mengonversi situs web Anda menjadi APK native tanpa coding.
            Cepat, aman, dan elegan.
          </motion.p>
          <motion.div
            variants={fadeUpChild}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 bg-white text-black font-semibold px-8 py-4 rounded-full hover:bg-gray-200 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <span>Mulai Buat APK</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 border border-gray-700 text-gray-300 font-semibold px-8 py-4 rounded-full hover:bg-gray-900 transition-all"
            >
              Pelajari Selengkapnya
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section (dark cards on black, monochrome premium) */}
      <div className="relative z-10 pb-32 max-w-6xl mx-auto px-4" id="features">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-gray-900/60 backdrop-blur-sm border border-gray-800 hover:border-gray-700 transition-all"
            >
              <feature.icon className="w-8 h-8 text-white mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}

const features = [
  {
    icon: Code2,
    title: "Tanpa Coding",
    desc: "Cukup masukkan URL, sistem kami akan membungkusnya menjadi aplikasi Android siap pakai.",
  },
  {
    icon: Zap,
    title: "Performa Native",
    desc: "WebView yang dioptimalkan dengan injeksi watermark otomatis dan user‑agent khusus.",
  },
  {
    icon: Smartphone,
    title: "Siap Rilis",
    desc: "APK bisa langsung diunggah ke Google Play Store atau didistribusikan ke pengguna Anda.",
  },
];
