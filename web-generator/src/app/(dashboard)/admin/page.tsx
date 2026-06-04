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
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

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

export default function AdminPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // System Controls
  const [promoEnabled, setPromoEnabled] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [savingControls, setSavingControls] = useState(false);

  // Advanced Watermark Manager
  const [wmType, setWmType] = useState("text");
  const [wmText, setWmText] = useState("Created via Our Builder");
  const [wmImageUrl, setWmImageUrl] = useState("");
  const [wmOpacity, setWmOpacity] = useState(0.8);
  const [wmSize, setWmSize] = useState(14);
  const [savingWm, setSavingWm] = useState(false);

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

      // Fetch global settings
      const { data: settings } = await supabase.from("global_settings").select("*");
      if (settings) {
        for (const s of settings) {
          if (s.key === "promo_enabled") setPromoEnabled(s.value === "true");
          if (s.key === "maintenance_mode") setMaintenanceMode(s.value === "true");
          if (s.key === "watermark_type") setWmType(s.value);
          if (s.key === "watermark_text") setWmText(s.value);
          if (s.key === "watermark_image_url") setWmImageUrl(s.value);
          if (s.key === "watermark_opacity") setWmOpacity(parseFloat(s.value) || 0.8);
          if (s.key === "watermark_size") setWmSize(parseInt(s.value) || 14);
        }
      }

      // Fetch all projects and user emails
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectsData) {
        setProjects(projectsData);
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

  const saveControls = async () => {
    setSavingControls(true);
    const settings = [
      { key: "promo_enabled", value: String(promoEnabled) },
      { key: "maintenance_mode", value: String(maintenanceMode) },
    ];
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        alert("System controls saved.");
      } else {
        alert("Failed to save controls.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setSavingControls(false);
    }
  };

  const saveWatermark = async () => {
    setSavingWm(true);
    const settings = [
      { key: "watermark_type", value: wmType },
      { key: "watermark_text", value: wmText },
      { key: "watermark_image_url", value: wmImageUrl },
      { key: "watermark_opacity", value: String(wmOpacity) },
      { key: "watermark_size", value: String(wmSize) },
    ];
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        alert("Watermark settings saved.");
      } else {
        alert("Failed to save watermark settings.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setSavingWm(false);
    }
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
            className="flex items-center gap-4"
          >
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
              <ArrowLeft size={24} />
            </Link>
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

          {/* System Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-6 space-y-6"
          >
            <h2 className="text-xl font-semibold text-white">System Controls</h2>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Enable Global Promo Popup</span>
              <button
                onClick={() => setPromoEnabled(!promoEnabled)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  promoEnabled ? "bg-white" : "bg-white/[0.08]"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-black transform transition-transform ${
                    promoEnabled ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Maintenance Mode</span>
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  maintenanceMode ? "bg-white" : "bg-white/[0.08]"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-black transform transition-transform ${
                    maintenanceMode ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
            <button
              onClick={saveControls}
              disabled={savingControls}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-70"
            >
              {savingControls ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
              Save Controls
            </button>
          </motion.div>

          {/* Advanced Watermark Manager */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-6 space-y-6"
          >
            <h2 className="text-xl font-semibold text-white">Advanced Watermark Manager</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300">Watermark Type</label>
                  <select
                    value={wmType}
                    onChange={(e) => setWmType(e.target.value)}
                    className="mt-1 w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                  </select>
                </div>

                {wmType === "text" ? (
                  <div>
                    <label className="text-sm text-gray-300">Watermark Text</label>
                    <input
                      type="text"
                      value={wmText}
                      onChange={(e) => setWmText(e.target.value)}
                      className="mt-1 w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-sm text-gray-300">Watermark Image URL</label>
                    <input
                      type="text"
                      value={wmImageUrl}
                      onChange={(e) => setWmImageUrl(e.target.value)}
                      className="mt-1 w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-300">Opacity</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={wmOpacity}
                      onChange={(e) => setWmOpacity(parseFloat(e.target.value))}
                      className="mt-1 w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300">Size (px)</label>
                    <input
                      type="number"
                      value={wmSize}
                      onChange={(e) => setWmSize(parseInt(e.target.value))}
                      className="mt-1 w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </div>
                </div>
                <button
                  onClick={saveWatermark}
                  disabled={savingWm}
                  className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-70"
                >
                  {savingWm ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                  Save Watermark
                </button>
              </div>

              {/* Live Preview - smartphone style */}
              <div className="flex justify-center items-center">
                <div className="relative w-[220px] h-[400px] bg-black rounded-3xl border-2 border-gray-700 overflow-hidden shadow-xl">
                  {/* Fake notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-5 bg-black rounded-b-xl z-10"></div>
                  {/* Status bar */}
                  <div className="absolute top-0 left-0 right-0 h-6 bg-black flex justify-between items-center px-4 text-[10px] text-gray-400 z-10">
                    <span>9:41</span>
                    <span>📶 🔋</span>
                  </div>
                  {/* Screen content */}
                  <div className="mt-6 h-[calc(100%-24px)] bg-gray-100 flex items-center justify-center relative">
                    {wmType === "text" ? (
                      <span
                        style={{
                          position: "absolute",
                          bottom: 8,
                          opacity: wmOpacity,
                          fontSize: `${wmSize}px`,
                          color: "white",
                          textShadow: "0 0 6px black",
                        }}
                      >
                        {wmText}
                      </span>
                    ) : (
                      <img
                        src={wmImageUrl || "https://via.placeholder.com/80"}
                        alt="watermark preview"
                        style={{
                          position: "absolute",
                          bottom: 8,
                          right: 8,
                          opacity: wmOpacity,
                          width: `${wmSize * 2}px`,
                        }}
                      />
                    )}
                    <span className="text-gray-400 text-xs absolute top-2 left-2">Preview</span>
                  </div>
                </div>
              </div>
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
