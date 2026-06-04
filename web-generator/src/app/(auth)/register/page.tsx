// file: web-generator/src/app/(auth)/register/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import Link from "next/link";
import { Loader2, ArrowRight, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setMessage({
        type: "success",
        text: "Cek email Anda untuk konfirmasi.",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-950 opacity-80 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-10 shadow-2xl">
          <div className="text-center mb-8">
            <UserPlus className="w-8 h-8 mx-auto mb-2 text-white/80" />
            <h1 className="text-3xl font-semibold tracking-tight">Buat Akun</h1>
            <p className="text-gray-400 mt-2 text-sm">
              Mulai buat APK premium Anda
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nama@email.com"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Kata Sandi
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
            </div>

            {/* Custom Captcha placeholder */}
            <div
              id="custom-captcha-container"
              className="flex items-center justify-center py-2"
              data-sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY}
              style={{ minHeight: 60 }}
            >
              {/* Custom captcha widget will mount here */}
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={`text-sm rounded-xl p-3 ${
                  message.type === "error"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-green-500/10 text-green-400 border border-green-500/20"
                }`}
              >
                {message.text}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Daftar</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-white underline underline-offset-2 hover:text-gray-200"
            >
              Masuk
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
