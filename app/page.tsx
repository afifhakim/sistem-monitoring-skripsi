import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { GraduationCap, ArrowRight, BookOpen, UserCheck, Cloud, FileCode, CheckCircle2, BarChart3 } from "lucide-react";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === "DOSEN") {
      redirect("/dosen");
    } else {
      redirect("/mahasiswa");
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">SkripsiTrack</span>
              <span className="text-[10px] text-slate-400 block -mt-1">Monitoring & Arsip Bimbingan</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow"
            >
              Masuk Sistem
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 my-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-medium mb-6">
            <BarChart3 className="w-3.5 h-3.5" /> Manajemen Mahasiswa Skripsi & Repositori Berkas Terorganisir
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Pantau Progres Skripsi & Kelola Berkas Simulasi dengan Rapi
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed">
            Sistem terpadu untuk Dosen Pembimbing memantau jumlah mahasiswa bimbingan setiap tahun,
            meninjau logbook mingguan, serta menyimpan dokumen PDF, materi presentasi, dan file komputasi mentah
            langsung ke Google Drive Anda.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/25"
            >
              Masuk ke Portal <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition"
            >
              Pendaftaran Mahasiswa Baru
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-2xl backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Statistik Mahasiswa per Tahun</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ketahui secara pasti berapa mahasiswa yang mendaftar di Anda setiap tahun akademik (2023, 2024, 2025, dst.) lengkap dengan status kemajuan (Proposal, Penelitian, Sidang, Lulus).
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-2xl backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Logbook Progres & Review Dosen</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mahasiswa mencatat capaian dan kendala tiap minggu. Dosen dapat memberi catatan arahan, feedback revisi, dan menyetujui logbook secara digital.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-2xl backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Cloud className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Integrasi Google Drive & Raw Data</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unggah naskah PDF, slide presentasi PPT, serta file mentah simulasi/perhitungan (Jupyter, Excel, MATLAB, ANSYS ZIP) yang otomatis terkelompok ke Google Drive.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        Sistem Manajemen Progres Skripsi & Repositori Simulasi &copy; 2026. Siap dihubungkan ke GitHub.
      </footer>
    </div>
  );
}
