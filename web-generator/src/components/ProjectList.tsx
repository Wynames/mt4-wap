// file: web-generator/src/components/ProjectList.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, Loader2, CheckCircle, XCircle, Download } from "lucide-react";

interface Project {
  id: string;
  app_name: string;
  target_url: string;
  package_name: string;
  status: string;
  config: any;
  created_at: string;
}

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-6"
    >
      <h2 className="text-xl font-semibold text-white mb-6">Proyek Anda</h2>
      {projects.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Belum ada proyek. Buat APK pertama Anda.
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
                <th className="pb-3 font-medium">Download</th>
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
                    <td className="py-4">
                      {project.status === "completed" && project.config?.download_url ? (
                        <a
                          href={project.config.download_url}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-full transition"
                        >
                          <Download size={14} />
                          Download APK
                        </a>
                      ) : project.status === "waiting" ? (
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Menunggu
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">-</span>
                      )}
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
  );
}
