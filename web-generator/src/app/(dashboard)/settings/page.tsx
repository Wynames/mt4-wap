// file: web-generator/src/app/(dashboard)/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Loader2, LogOut, User, Key, ToggleLeft, ToggleRight } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Local toggles (could be persisted later)
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [pullToRefreshEnabled, setPullToRefreshEnabled] = useState(true);
  const [antiScreenshotEnabled, setAntiScreenshotEnabled] = useState(false);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
        setProfile(data);
        // Load preferences from user config (if stored in config column or elsewhere)
        if (data?.config) {
          setWatermarkEnabled(data.config.watermark ?? true);
          setPullToRefreshEnabled(data.config.pullToRefresh ?? true);
          setAntiScreenshotEnabled(data.config.antiScreenshot ?? false);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const savePreferences = async () => {
    // Save to user config (assumes config column exists on users table)
    const { error } = await supabase
      .from("users")
      .update({
        config: {
          watermark: watermarkEnabled,
          pullToRefresh: pullToRefreshEnabled,
          antiScreenshot: antiScreenshotEnabled,
        },
      })
      .eq("id", profile.id);

    if (error) {
      alert("Failed to save preferences.");
    } else {
      alert("Preferences saved.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-8"
      >
        <h1 className="text-3xl font-semibold">Settings</h1>

        {/* Profile */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <User className="w-10 h-10 text-gray-400" />
            <div>
              <p className="text-lg font-medium">{profile?.email}</p>
              <p className="text-sm text-gray-400 capitalize">Role: {profile?.role}</p>
            </div>
          </div>

          {/* Update Password */}
          <div className="border-t border-white/[0.08] pt-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Key size={18} /> Update Password
            </h2>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current password"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              <input
                type="password"
                placeholder="New password"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              <button className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition">
                Update Password
              </button>
            </div>
          </div>

          {/* Application Default Config */}
          <div className="border-t border-white/[0.08] pt-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ToggleLeft size={18} /> Application Default Config
            </h2>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setWatermarkEnabled(!watermarkEnabled)}>
              <span className="text-sm text-gray-300">Watermark</span>
              <div className="relative">
                <input type="checkbox" checked={watermarkEnabled} onChange={() => {}} className="sr-only" />
                <div className={`w-10 h-6 rounded-full transition-colors ${watermarkEnabled ? "bg-white" : "bg-white/[0.08]"}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${watermarkEnabled ? "translate-x-4 bg-black" : "translate-x-0 bg-gray-400"}`} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setPullToRefreshEnabled(!pullToRefreshEnabled)}>
              <span className="text-sm text-gray-300">Pull-to-Refresh</span>
              <div className="relative">
                <input type="checkbox" checked={pullToRefreshEnabled} onChange={() => {}} className="sr-only" />
                <div className={`w-10 h-6 rounded-full transition-colors ${pullToRefreshEnabled ? "bg-white" : "bg-white/[0.08]"}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${pullToRefreshEnabled ? "translate-x-4 bg-black" : "translate-x-0 bg-gray-400"}`} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setAntiScreenshotEnabled(!antiScreenshotEnabled)}>
              <span className="text-sm text-gray-300">Anti-Screenshot</span>
              <div className="relative">
                <input type="checkbox" checked={antiScreenshotEnabled} onChange={() => {}} className="sr-only" />
                <div className={`w-10 h-6 rounded-full transition-colors ${antiScreenshotEnabled ? "bg-white" : "bg-white/[0.08]"}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${antiScreenshotEnabled ? "translate-x-4 bg-black" : "translate-x-0 bg-gray-400"}`} />
                </div>
              </div>
            </div>
            <button
              onClick={savePreferences}
              className="mt-4 px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Save Preferences
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-white/[0.08] pt-6">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
