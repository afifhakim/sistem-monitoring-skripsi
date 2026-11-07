"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ArrowLeft, AlertCircle, BookOpen, UserCheck, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"MAHASISWA" | "DOSEN">("MAHASISWA");
  const [dosenList, setDosenList] = useState<{ id: string; name: string; department: string }[]>([]);

  // Form Data Mahasiswa
  const [mhsForm, setMhsForm] = useState({
    name: "",
    nim: "",
    email: "",
    password: "",
    academicYear: "2026/2027",
    thesisTitle: "",
    topic: "",
    dosenId: "",
  });

  // Form Data Dosen
  const [dosenForm, setDosenForm] = useState({
    name: "",
    email: "",
    password: "",
    nip: "",
    department: "Teknik",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dosen/list")
      .then((res) => res.json())
      .then((data) => {
        if (data.dosens && data.dosens.length > 0) {
          setDosenList(data.dosens);
          // Set default to Afif Taufiiqul Hakim if exists
          const afif = data.dosens.find((d: any) => d.id === "usr-afif-hakim") || data.dosens[0];
          setMhsForm((prev) => ({ ...prev, dosenId: afif.id }));
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = role === "MAHASISWA" ? { ...mhsForm, role: "MAHASISWA" } : { ...dosenForm, role: "DOSEN" };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mendaftar.");
      }

      if (data.user.role === "DOSEN") {
        router.push("/dosen");
      } else {
        router.push("/mahasiswa");
      }
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
          Pendaftaran Akun Skripsi
        </h2>
        <p className="mt-1 text-xs text-slate-300">
          Daftar sebagai Mahasiswa Bimbingan atau Dosen Pembimbing Baru
        </p>

        {/* Tab Role Selector */}
        <div className="mt-4 grid grid-cols-2 gap-2 p-1 bg-slate-800/80 rounded-xl border border-slate-700 max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setRole("MAHASISWA")}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              role === "MAHASISWA" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Mahasiswa Bimbingan
          </button>
          <button
            type="button"
            onClick={() => setRole("DOSEN")}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              role === "DOSEN" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Dosen Pembimbing
          </button>
        </div>
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
            {role === "MAHASISWA" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-200 mb-1">Nama Lengkap Mahasiswa</label>
                    <input
                      type="text"
                      required
                      placeholder="Misal: Budi Santoso"
                      value={mhsForm.name}
                      onChange={(e) => setMhsForm({ ...mhsForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-200 mb-1">Nomor Induk Mahasiswa (NIM)</label>
                    <input
                      type="text"
                      required
                      placeholder="Misal: 220401001"
                      value={mhsForm.nim}
                      onChange={(e) => setMhsForm({ ...mhsForm, nim: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-200 mb-1">Alamat Email</label>
                    <input
                      type="email"
                      required
                      placeholder="nama@kampus.ac.id"
                      value={mhsForm.email}
                      onChange={(e) => setMhsForm({ ...mhsForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-200 mb-1">Kata Sandi</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimal 6 karakter"
                      value={mhsForm.password}
                      onChange={(e) => setMhsForm({ ...mhsForm, password: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Pilih Dosen Pembimbing */}
                <div>
                  <label className="block font-medium text-slate-200 mb-1">
                    Dosen Pembimbing Skripsi
                  </label>
                  <select
                    value={mhsForm.dosenId}
                    onChange={(e) => setMhsForm({ ...mhsForm, dosenId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    {dosenList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-200 mb-1">Tahun Akademik Bimbingan</label>
                    <select
                      value={mhsForm.academicYear}
                      onChange={(e) => setMhsForm({ ...mhsForm, academicYear: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      placeholder="Misal: Termofluida / CFD / IoT / Struktur"
                      value={mhsForm.topic}
                      onChange={(e) => setMhsForm({ ...mhsForm, topic: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-200 mb-1">Rencana / Usulan Judul Skripsi</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Tuliskan usulan judul skripsi atau topik penelitian yang akan dibahas..."
                    value={mhsForm.thesisTitle}
                    onChange={(e) => setMhsForm({ ...mhsForm, thesisTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            ) : (
              /* Form Registrasi Dosen Pembimbing Baru */
              <>
                <div className="p-3 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-200 leading-relaxed text-[11px]">
                  <strong>Pendaftaran Dosen Pembimbing:</strong> Setiap dosen akan mendapatkan dashboard pemantauan terpisah dan dapat menghubungkan akun Google Drive masing-masing untuk menyimpan berkas skripsi mahasiswa.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-200 mb-1">Nama Lengkap & Gelar</label>
                    <input
                      type="text"
                      required
                      placeholder="Misal: Dr. Eng. Nama Dosen, M.T."
                      value={dosenForm.name}
                      onChange={(e) => setDosenForm({ ...dosenForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-200 mb-1">NIP / NIDN (Opsional)</label>
                    <input
                      type="text"
                      placeholder="198501012015041001"
                      value={dosenForm.nip}
                      onChange={(e) => setDosenForm({ ...dosenForm, nip: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-200 mb-1">Alamat Email Dosen</label>
                    <input
                      type="email"
                      required
                      placeholder="dosen@kampus.ac.id"
                      value={dosenForm.email}
                      onChange={(e) => setDosenForm({ ...dosenForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-200 mb-1">Kata Sandi</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimal 6 karakter"
                      value={dosenForm.password}
                      onChange={(e) => setDosenForm({ ...dosenForm, password: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-200 mb-1">Program Studi / Departemen</label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Teknik Mesin / Teknik Elektro / Informatika"
                    value={dosenForm.department}
                    onChange={(e) => setDosenForm({ ...dosenForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-2.5 px-4 rounded-xl shadow-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50"
            >
              {loading
                ? "Mendaftarkan..."
                : role === "MAHASISWA"
                ? "Daftar sebagai Mahasiswa Bimbingan"
                : "Daftar sebagai Dosen Pembimbing"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
