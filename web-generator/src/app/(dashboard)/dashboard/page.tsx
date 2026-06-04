// file: web-generator/src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CreateForm from "@/components/CreateForm";
import ProjectList from "@/components/ProjectList";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Box,
  XCircle,
  Sparkles,
} from "lucide-react";

interface Project {
  id: string;
  app_name: string;
  target_url: string;
  package_name: string;
  status: string;
  config: any;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global settings state
  const [promoEnabled, setPromoEnabled] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showPromo, setShowPromo] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setProjects(data || []);
  }, [user]);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUser(user);

      const [{ data: profileData }, { data: projectsData }, { data: settings }] =
        await Promise.all([
          supabase.from("users").select("*").eq("id", user.id).single(),
          supabase
            .from("projects")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase.from("global_settings").select("*"),
        ]);

      setProfile(profileData);
      setProjects(projectsData || []);

      if (settings) {
        for (const s of settings) {
          if (s.key === "promo_enabled") setPromoEnabled(s.value === "true");
          if (s.key === "maintenance_mode") setMaintenanceMode(s.value === "true");
        }
      }

      setLoading(false);
    };
    init();
  }, []);

  // Promo modal logic – separate effect to avoid hydration issues
  useEffect(() => {
    if (!loading && promoEnabled && !localStorage.getItem("promo_seen")) {
      setShowPromo(true);
    }
  }, [loading, promoEnabled]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("projects-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects", filter: `user_id=eq.${user.id}` },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchProjects]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const dismissPromo = () => {
    localStorage.setItem("promo_seen", "true");
    setShowPromo(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-gray-400">
        Silakan masuk terlebih dahulu.
      </div>
    );
  }

  // Maintenance Mode Check
  if (maintenanceMode && profile?.role !== "owner") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle className="w-16 h-16 mx-auto text-red-400" />
          <h1 className="text-3xl font-semibold">System Under Maintenance</h1>
          <p className="text-gray-400">
            We are performing scheduled maintenance. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Owners bypass daily limit
  const isOwner = profile?.role === "owner";
  const dailyLimitReached = !isOwner && profile?.daily_build_count >= 3;
  const isToday =
    profile?.last_build_date === new Date().toISOString().slice(0, 10);
  const effectiveLimitReached = isToday ? dailyLimitReached : false;

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/10 backdrop-blur-md p-2 rounded-lg"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen overflow-y-auto w-64 bg-black/80 backdrop-blur-xl border-r border-white/[0.08] z-40 flex flex-col 
          transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0 lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 flex-1">
          <div className="flex items-center gap-2 mb-8">
            <Box className="w-6 h-6 text-white" />
            <span className="text-xl font-semibold tracking-tight">
              APK Builder
            </span>
          </div>

          <nav className="space-y-1">
            <a
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.06] text-white"
            >
              <LayoutDashboard size={18} />
              Overview
            </a>
            {isOwner && (
              <a
                href="/admin"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-white/[0.04] hover:text-white transition"
              >
                <ShieldAlert size={18} />
                Admin Panel
              </a>
            )}
            <a
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-white/[0.04] hover:text-white transition"
            >
              <Settings size={18} />
              Settings
            </a>
          </nav>

          <div className="mt-8 pt-6 border-t border-white/[0.08]">
            <div className="text-sm text-gray-400 mb-1">{profile?.email}</div>
            <div className="text-xs text-gray-500 capitalize">
              Role: {profile?.role}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/[0.08]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 mt-12 lg:mt-0">
        <div className="max-w-5xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Buat dan kelola APK Anda dengan mudah
            </p>
          </motion.div>

          <CreateForm dailyLimitReached={effectiveLimitReached} />

          <ProjectList projects={projects} />
        </div>
      </main>

      {/* Promo Modal (Updated) */}
      <AnimatePresence>
        {showPromo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white text-black rounded-3xl overflow-hidden max-w-sm w-full relative shadow-2xl"
            >
              <button
                onClick={dismissPromo}
                className="absolute top-3 right-3 z-10 bg-black/20 rounded-full p-1 text-white hover:bg-black/40"
              >
                <XCircle size={20} />
              </button>
              <img
                src="https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800"
                alt="Free Domain"
                className="w-full h-40 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Free Domain</h3>
                <p className="text-gray-600 mb-4">
                  Dapatkan domain gratis untuk website Anda dengan hosting premium.
                </p>
                <a
                  href=""
                  target="_blank"
                  className="block w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition mb-2"
                >
                  Visit Web
                </a>
                <button
                  onClick={dismissPromo}
                  className="text-sm text-gray-500 underline hover:text-black"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
