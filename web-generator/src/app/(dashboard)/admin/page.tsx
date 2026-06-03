// file: web-generator/src/app/(dashboard)/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
  Loader2,
  ShieldAlert,
  Users,
  Box,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  Download,
  Save,
} from "lucide-react";

interface Project {
  id: string;
  app_name: string;
  target_url: string;
  package_name: string;
  status: string;
  config: any;
  created_at: string;
  user_id: string;
}

interface UserProfile {
  id: string;
  email: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global system settings state
  const [globalWatermark, setGlobalWatermark] = useState("Created via Our Builder");
  const [savingWatermark, setSavingWatermark] = useState(false);

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

      const { data: profileData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      if (profileData?.role !== "owner") {
        setLoading(false);
        return;
      }

      // Fetch global watermark config from a global_settings table (or fallback to default)
      const { data: globalData } = await supabase
        .from("global_settings")
        .select("value")
        .eq("key", "watermark_text")
        .single();

      if (globalData) {
        setGlobalWatermark(globalData.value);
      }

      // Fetch all projects and user emails
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectsData) {
        setProjects(projectsData);
        // Get unique user IDs
        const userIds = Array.from(new Set(projectsData.map((p) => p.user_id)));
        const { data: usersData } = await supabase
          .from("users")
          .select("id, email")
          .in("id", userIds);
        if (usersData) {
          const userMap: Record<string, string> = {};
          usersData.forEach((u) => (userMap[u.id] = u.email));
          setUsers(userMap);
        }
        // Count unique users who have built something
        setTotalUsers(userIds.length);
      }

      setLoading(false);
    };
    init();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSaveWatermark = async () => {
    setSavingWatermark(true);
    // Upsert global watermark setting
    const { error } = await supabase.from("global_settings").upsert({
      key: "watermark_text",
      value: globalWatermark,
    }, { onConflict: "key" });

    if (!error) {
      alert("Watermark text saved successfully.");
    } else {
      alert("Failed to save watermark.");
    }
    setSavingWatermark(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user || profile?.role !== "owner") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-gray-400">
        Akses ditolak. Hanya owner yang dapat melihat halaman ini.
      </div>
    );
  }

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
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-white/[0.04] hover:text-white transition"
            >
              <LayoutDashboard size={18} />
              Overview
            </a>
            <a
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.06] text-white"
            >
              <ShieldAlert size={18} />
              Admin Panel
            </a>
            <a
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-white/[0.04] hover:text-white transition"
            >
              <Settings size={18} />
              Settings
            </a>
          </nav>

          <div className="mt-8 pt-6 border-t border-white/[0.08]">
            <div className="text-sm text-gray-400 mb-1">{user.email}</div>
            <div className="text-xs text-gray-500 capitalize">
              Role: owner
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
        <div className="max-w-6xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <ShieldAlert className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-semibold">Admin Panel</h1>
          </motion.div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-6 flex items-center gap-4"
            >
              <Users className="w-10 h-10 text-gray-400" />
              <div>
                <p className="text-2xl font-semibold">{totalUsers}</p>
                <p className="text-sm text-gray-400">Total Users</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-6 flex items-center gap-4"
            >
              <Box className="w-10 h-10 text-gray-400" />
              <div>
                <p className="text-2xl font-semibold">{projects.length}</p>
                <p className="text-sm text-gray-400">Total Projects Built</p>
              </div>
            </motion.div>
          </div>

          {/* Global System Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-6 space-y-4"
          >
            <h2 className="text-xl font-semibold text-white">Global System Settings</h2>
            <div className="space-y-3">
              <label className="block text-sm text-gray-300">Default Watermark Text</label>
              <input
                type="text"
                value={globalWatermark}
                onChange={(e) => setGlobalWatermark(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              <button
                onClick={handleSaveWatermark}
                disabled={savingWatermark}
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-70"
              >
                {savingWatermark ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                Save Watermark
              </button>
            </div>
          </motion.div>

          {/* Projects Table */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Semua Proyek</h2>
            {projects.length === 0 ? (
              <p className="text-gray-500">Belum ada proyek.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-sm text-gray-400">
                      <th className="pb-3 font-medium">User</th>
                      <th className="pb-3 font-medium">Aplikasi</th>
                      <th className="pb-3 font-medium">URL Target</th>
                      <th className="pb-3 font-medium">Paket</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr
                        key={project.id}
                        className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="py-4 text-gray-400">{users[project.user_id] || "Unknown"}</td>
                        <td className="py-4 font-medium">{project.app_name}</td>
                        <td className="py-4 text-gray-400 truncate max-w-[150px]">{project.target_url}</td>
                        <td className="py-4 text-gray-500 text-sm">{project.package_name}</td>
                        <td className="py-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.05] text-xs">
                            {project.status}
                          </span>
                        </td>
                        <td className="py-4">
                          {project.status === "completed" && project.config?.download_url ? (
                            <a
                              href={project.config.download_url}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-full transition"
                            >
                              <Download size={14} />
                              Download
                            </a>
                          ) : (
                            <span className="text-gray-500 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

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
