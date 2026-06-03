// file: web-generator/src/app/(dashboard)/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Loader2, LogOut, User } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        <h1 className="text-3xl font-semibold">Settings</h1>

        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <User className="w-10 h-10 text-gray-400" />
            <div>
              <p className="text-lg font-medium">{profile?.email}</p>
              <p className="text-sm text-gray-400 capitalize">Role: {profile?.role}</p>
            </div>
          </div>

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
