// file: web-generator/src/components/CreateForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle, Sparkles } from "lucide-react";

interface CreateFormProps {
  dailyLimitReached: boolean;
}

export default function CreateForm({ dailyLimitReached }: CreateFormProps) {
  const [appName, setAppName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [packageName, setPackageName] = useState("");
  const [pullToRefresh, setPullToRefresh] = useState(true);
  const [antiScreenshot, setAntiScreenshot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (dailyLimitReached) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/trigger-build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appName,
          targetUrl,
          packageName,
          config: { pullToRefresh, antiScreenshot },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses permintaan");
      }

      setMessage({
        type: "success",
        text: "Proyek berhasil dibuat! APK akan segera dibangun.",
      });
      // Reset form
      setAppName("");
      setTargetUrl("");
      setPackageName("");
      setPullToRefresh(true);
      setAntiScreenshot(false);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (dailyLimitReached) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-8 text-center"
      >
        <div className="flex justify-center mb-4 text-yellow-400">
          <Sparkles className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Kuota Harian Tercapai
        </h2>
        <p className="text-gray-400">
          Anda telah membuat 3 APK hari ini. Coba lagi besok untuk melanjutkan.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-8 shadow-2xl"
    >
      <h2 className="text-2xl font-semibold text-white mb-6">
        Buat APK Baru
      </h2>

      <div className="space-y-5">
        {/* App Name */}
        <div>
          <label
            htmlFor="appName"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Nama Aplikasi
          </label>
          <input
            id="appName"
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            required
            placeholder="My Awesome App"
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
          />
        </div>

        {/* Target URL */}
        <div>
          <label
            htmlFor="targetUrl"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            URL Target
          </label>
          <input
            id="targetUrl"
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            required
            placeholder="https://example.com"
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
          />
        </div>

        {/* Package Name */}
        <div>
          <label
            htmlFor="packageName"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Nama Paket (Package Name)
          </label>
          <input
            id="packageName"
            type="text"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            required
            placeholder="com.example.app"
            pattern="^([a-zA-Z_]{1}[a-zA-Z0-9_]*(\.[a-zA-Z_]{1}[a-zA-Z0-9_]*)*)$"
            title="Format: com.example.app"
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
          />
        </div>

        {/* Toggle Switches */}
        <div className="flex flex-col sm:flex-row gap-6 pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={pullToRefresh}
                onChange={(e) => setPullToRefresh(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-white/[0.08] rounded-full peer-checked:bg-white peer-checked:ring-2 peer-checked:ring-white/30 transition-all" />
              <div className="absolute top-1 left-1 w-4 h-4 bg-gray-400 rounded-full peer-checked:bg-black peer-checked:translate-x-4 transition-transform" />
            </div>
            <span className="text-sm text-gray-300">Pull-to-Refresh</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={antiScreenshot}
                onChange={(e) => setAntiScreenshot(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-white/[0.08] rounded-full peer-checked:bg-white peer-checked:ring-2 peer-checked:ring-white/30 transition-all" />
              <div className="absolute top-1 left-1 w-4 h-4 bg-gray-400 rounded-full peer-checked:bg-black peer-checked:translate-x-4 transition-transform" />
            </div>
            <span className="text-sm text-gray-300">Anti-Screenshot</span>
          </label>
        </div>

        {/* Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={`flex items-center gap-2 text-sm rounded-xl p-3 ${
              message.type === "error"
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-green-500/10 text-green-400 border border-green-500/20"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            {message.text}
          </motion.div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Buat APK</span>
              <Sparkles className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}
