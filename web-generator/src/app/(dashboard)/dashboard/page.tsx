// file: web-generator/src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import CreateForm from "@/components/CreateForm";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Zap, Code, Clock, CheckCircle, XCircle } from "lucide-react";

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
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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

      const [{ data: profileData }, { data: projectsData }] = await Promise.all([
        supabase.from("users").select("*").eq("id", user.id).single(),
        supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      setProfile(profileData);
      setProjects(projectsData || []);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] text-gray-400">
        Silakan masuk terlebih dahulu.
      </div>
    );
  }

  const dailyLimitReached = profile?.daily_build_count >= 3;
  const isToday = profile?.last_build_date === new Date().toISOString().slice(0, 10);
  const effectiveLimitReached = isToday ? dailyLimitReached : false;

  const statusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              {profile?.email}
              <span className="ml-2 px-2 py-0.5 bg-white/[0.06] rounded-full text-xs text-gray-300">
                {profile?.role === "owner" ? "Owner" : "User"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              {profile?.daily_build_count ?? 0} / 3 APK hari ini
            </span>
            {profile?.role === "owner" && (
              <span className="flex items-center gap-1 text-white">
                <Code className="w-4 h-4" />
                Owner Panel
              </span>
            )}
          </div>
        </motion.div>

        {/* Create Form */}
        <CreateForm dailyLimitReached={effectiveLimitReached} />

        {/* Project List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Proyek Anda</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Belum ada proyek. Buat APK pertama Anda di atas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.08] text-sm text-gray-400">
                    <th className="pb-3 font-medium">Aplikasi</th>
                    <th className="pb-3 font-medium">URL Target</th>
                    <th className="pb-3 font-medium">Paket</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Dibuat</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {projects.map((project) => (
                      <motion.tr
                        key={project.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="py-4 font-medium">{project.app_name}</td>
                        <td className="py-4 text-gray-400 truncate max-w-[200px]">
                          {project.target_url}
                        </td>
                        <td className="py-4 text-gray-500">{project.package_name}</td>
                        <td className="py-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.05] text-xs">
                            {statusIcon(project.status)}
                            {project.status}
                          </span>
                        </td>
                        <td className="py-4 text-gray-500 text-sm">
                          {new Date(project.created_at).toLocaleDateString("id-ID")}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
