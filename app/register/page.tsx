"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    nim: "",
    email: "",
    password: "",
    academicYear: "2026/2027",
    thesisTitle: "",
    topic: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mendaftar.");
      }

      router.push("/mahasiswa");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-10 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center px-4">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke halaman login
        </Link>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-xl mb-3 border border-indigo-400/30">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Pendaftaran Mahasiswa Bimbingan Skripsi
        </h2>
        <p className="mt-1 text-xs text-indigo-300 font-medium">
          Dosen Pembimbing: Afif Taufiiqul Hakim
        </p>
        <p className="text-[11px] text-slate-300">
          Lengkapi data diri dan rencana topik penelitian skripsi Anda
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white/10 backdrop-blur-md py-6 px-6 shadow-2xl rounded-2xl border border-white/20 text-slate-100">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-200 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Misal: Budi Santoso"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-200 mb-1">Nomor Induk Mahasiswa (NIM)</label>
                <input
                  type="text"
                  name="nim"
                  required
                  placeholder="Misal: 220401001"
                  value={formData.nim}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-200 mb-1">Alamat Email Kampus / Pribadi</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="nama@kampus.ac.id"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-200 mb-1">Kata Sandi</label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-200 mb-1">Tahun Akademik Bimbingan</label>
                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="2023/2024">2023/2024</option>
                  <option value="2024/2025">2024/2025</option>
                  <option value="2025/2026">2025/2026</option>
                  <option value="2026/2027">2026/2027</option>
                  <option value="2027/2028">2027/2028</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-200 mb-1">Bidang / Topik Penelitian</label>
                <input
                  type="text"
                  name="topic"
                  placeholder="Misal: Termofluida / CFD / IoT / Struktur"
                  value={formData.topic}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-200 mb-1">Rencana / Usulan Judul Skripsi</label>
              <textarea
                name="thesisTitle"
                rows={2}
                required
                placeholder="Tuliskan usulan judul skripsi atau topik penelitian yang akan dibahas..."
                value={formData.thesisTitle}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl shadow-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50"
            >
              {loading ? "Mendaftarkan..." : "Daftar sebagai Mahasiswa Bimbingan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
