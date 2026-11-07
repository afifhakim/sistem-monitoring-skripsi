"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, BookOpen, ShieldCheck, UserCheck, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    const targetEmail = customEmail || email;
    const targetPassword = customPass || password;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk.");
      }

      if (data.user.role === "DOSEN") {
        router.push("/dosen");
      } else {
        router.push("/mahasiswa");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  const setDemoDosen = () => {
    setEmail("afif@kampus.ac.id");
    setPassword("dosen123");
    handleLogin(undefined, "afif@kampus.ac.id", "dosen123");
  };

  const setDemoMhs = () => {
    setEmail("mhs@kampus.ac.id");
    setPassword("mhs123");
    handleLogin(undefined, "mhs@kampus.ac.id", "mhs123");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-xl mb-4 border border-indigo-400/30">
          <GraduationCap className="w-9 h-9 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Sistem Pemantauan Skripsi
        </h2>
        <p className="mt-2 text-sm text-indigo-300 font-medium">
          Dosen Pembimbing: Afif Taufiiqul Hakim
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          Pelaporan Progres Bimbingan, Arsip Berkas & Repositori Simulasi
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/10 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-white/20 sm:px-10 text-slate-100">
          {/* Quick Demo Login Buttons */}
          <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-400/20">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Uji Coba Cepat (Akun Demo)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={setDemoDosen}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition shadow text-center"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Login Dosen (Afif Taufiiqul Hakim)
              </button>
              <button
                type="button"
                onClick={setDemoMhs}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white transition shadow text-center"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Login Mahasiswa
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@kampus.ac.id"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Masuk ke Sistem"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Mahasiswa bimbingan baru?{" "}
            <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 underline">
              Daftar akun di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
