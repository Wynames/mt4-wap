// file: web-generator/src/app/(dashboard)/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Loader2, ShieldAlert } from "lucide-react";

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

      // Fetch all projects and user emails
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectsData) {
        setProjects(projectsData);
        // Get unique user IDs
        const userIds = [...new Set(projectsData.map((p) => p.user_id))];
        const { data: usersData } = await supabase
          .from("users")
          .select("id, email")
          .in("id", userIds);
        if (usersData) {
          const userMap: Record<string, string> = {};
          usersData.forEach((u) => (userMap[u.id] = u.email));
          setUsers(userMap);
        }
      }

      setLoading(false);
    };
    init();
  }, []);

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
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-white" />
          <h1 className="text-3xl font-semibold">Admin Panel</h1>
        </div>

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
                        {project.config?.download_url ? (
                          <a
                            href={project.config.download_url}
                            target="_blank"
                            className="text-blue-400 hover:underline text-sm"
                          >
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
      </motion.div>
    </div>
  );
}
