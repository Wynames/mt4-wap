// file: web-generator/src/app/(dashboard)/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Loader2, LogOut, User, Key, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Update password states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
        setProfile(data);
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleUpdatePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError("Password minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password tidak cocok.");
      return;
    }

    setUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdatingPassword(false);

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess("Password berhasil diperbarui.");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
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
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>

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
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              <button
                onClick={handleUpdatePassword}
                disabled={updatingPassword}
                className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-70"
              >
                {updatingPassword ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Update Password"
                )}
              </button>
              {passwordError && (
                <p className="text-red-400 text-sm">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-green-400 text-sm">{passwordSuccess}</p>
              )}
            </div>
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
