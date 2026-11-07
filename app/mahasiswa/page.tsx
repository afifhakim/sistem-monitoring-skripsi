"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  PlusCircle,
  UploadCloud,
  FileText,
  FileCode,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  FolderOpen,
  MessageSquare,
  LogOut,
  RefreshCw,
  Link as LinkIcon,
} from "lucide-react";

export default function MahasiswaDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Tambah Logbook
  const [showLogModal, setShowLogModal] = useState(false);
  const [logForm, setLogForm] = useState({
    weekNumber: 1,
    date: new Date().toISOString().split("T")[0],
    title: "",
    summary: "",
    blockers: "",
    nextPlan: "",
  });
  const [submittingLog, setSubmittingLog] = useState(false);

  // Modal Upload Berkas
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "driveLink">("driveLink");
  const [uploadCategory, setUploadCategory] = useState<string>("SIMULASI_RAW");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [driveUrlInput, setDriveUrlInput] = useState("");
  const [fileNameInput, setFileNameInput] = useState("");
  const [fileNotesInput, setFileNotesInput] = useState("");
  const [submittingUpload, setSubmittingUpload] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/mahasiswa/progress");
      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUserData(data.user);
      setLogs(data.logs || []);
      setFiles(data.files || []);

      // Auto set next week number
      if (data.logs && data.logs.length > 0) {
        const highestWeek = Math.max(...data.logs.map((l: any) => l.weekNumber || 1));
        setLogForm((prev) => ({ ...prev, weekNumber: highestWeek + 1 }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLog(true);

    try {
      const res = await fetch("/api/mahasiswa/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logForm),
      });

      if (res.ok) {
        setShowLogModal(false);
        setLogForm({
          weekNumber: logForm.weekNumber + 1,
          date: new Date().toISOString().split("T")[0],
          title: "",
          summary: "",
          blockers: "",
          nextPlan: "",
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingLog(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingUpload(true);
    setUploadMessage("");

    try {
      if (uploadMode === "driveLink") {
        const res = await fetch("/api/mahasiswa/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: uploadCategory,
            fileName: fileNameInput || "Berkas_Google_Drive",
            driveUrl: driveUrlInput,
            notes: fileNotesInput,
          }),
        });
        if (res.ok) {
          setShowUploadModal(false);
          setDriveUrlInput("");
          setFileNameInput("");
          setFileNotesInput("");
          fetchData();
        }
      } else {
        if (!fileToUpload) return;
        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("category", uploadCategory);
        formData.append("notes", fileNotesInput);

        const res = await fetch("/api/mahasiswa/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          setShowUploadModal(false);
          setFileToUpload(null);
          setFileNotesInput("");
          fetchData();
        }
      }
    } catch (err: any) {
      setUploadMessage(err.message || "Gagal mengunggah berkas.");
    } finally {
      setSubmittingUpload(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROPOSAL":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">Proposal</span>;
      case "PENELITIAN":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">Penelitian</span>;
      case "SEMINAR_HASIL":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800">Sem. Hasil</span>;
      case "SIDANG":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-800">Sidang Akhir</span>;
      case "LULUS":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">Lulus</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base leading-tight">Portal Mahasiswa Skripsi</h1>
              <p className="text-[11px] text-slate-400">Pelaporan Kemajuan & Pengunggahan Berkas Penelitian</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-xs font-medium text-rose-300 border border-rose-800/50 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Profile Card */}
        {userData && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900">{userData.name}</h2>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                    NIM: {userData.nim}
                  </span>
                  {getStatusBadge(userData.status)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Dosen Pembimbing: <strong className="text-indigo-700 font-bold">Afif Taufiiqul Hakim</strong> • Tahun Angkatan:{" "}
                  <strong className="text-slate-800">{userData.academicYear}</strong> • Topik:{" "}
                  <strong className="text-slate-800">{userData.topic}</strong>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowLogModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Isi Laporan Progres
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition"
                >
                  <UploadCloud className="w-4 h-4" />
                  Unggah Berkas / Raw Data
                </button>
              </div>
            </div>

            <div className="pt-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Judul Skripsi:
              </span>
              <p className="text-sm font-semibold text-slate-800 mt-0.5 leading-relaxed">
                {userData.thesisTitle}
              </p>
            </div>
          </div>
        )}

        {/* Action Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: Progress Logbook History */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">Riwayat Laporan Bimbingan ({logs.length})</h3>
              </div>
              <button
                onClick={() => setShowLogModal(true)}
                className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1"
              >
                + Tambah Log
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[550px] space-y-4 flex-1 text-xs">
              {logs.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p>Belum ada laporan progres yang diajukan.</p>
                  <button
                    onClick={() => setShowLogModal(true)}
                    className="mt-2 text-indigo-600 font-semibold underline"
                  >
                    Mulai isi logbook minggu pertama
                  </button>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-xl border ${
                      log.status === "DISETUJUI"
                        ? "bg-emerald-50/30 border-emerald-200"
                        : log.status === "PERLU_REVISI"
                        ? "bg-rose-50/30 border-rose-200"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          Minggu {log.weekNumber}: {log.title}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">Tanggal: {log.date}</span>
                      </div>
                      {log.status === "DISETUJUI" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Disetujui
                        </span>
                      )}
                      {log.status === "PERLU_REVISI" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Perlu Revisi
                        </span>
                      )}
                      {log.status === "MENUNGGU_REVIEW" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Menunggu Review
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 space-y-2">
                      <div>
                        <span className="text-slate-500 font-medium block">Capaian Progres:</span>
                        <p className="text-slate-700 whitespace-pre-wrap mt-0.5">{log.summary}</p>
                      </div>

                      {log.blockers && (
                        <div>
                          <span className="text-rose-600 font-medium block">Kendala / Tantangan:</span>
                          <p className="text-slate-700 whitespace-pre-wrap mt-0.5">{log.blockers}</p>
                        </div>
                      )}

                      {log.nextPlan && (
                        <div>
                          <span className="text-indigo-600 font-medium block">Rencana Selanjutnya:</span>
                          <p className="text-slate-700 whitespace-pre-wrap mt-0.5">{log.nextPlan}</p>
                        </div>
                      )}

                      {/* Catatan / Feedback dari Dosen Pembimbing */}
                      {log.dosenNotes && (
                        <div className="mt-3 p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                          <strong className="text-indigo-900 block flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" /> Catatan dari Dosen Pembimbing (Afif Taufiiqul Hakim):
                          </strong>
                          <p className="text-indigo-950 mt-1 whitespace-pre-wrap font-medium">{log.dosenNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 2: Repository of Uploaded Files */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Berkas Terunggah ({files.length})</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1"
              >
                + Unggah Berkas
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[550px] space-y-4 flex-1 text-xs">
              {files.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p>Belum ada berkas PDF, presentasi, atau data simulasi yang diunggah.</p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="mt-2 text-emerald-600 font-semibold underline"
                  >
                    Unggah berkas pertama sekarang
                  </button>
                </div>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {file.category === "DOKUMEN_PDF" && (
                        <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      {file.category === "PRESENTASI" && (
                        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                      )}
                      {file.category === "SIMULASI_RAW" && (
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                          <FileCode className="w-5 h-5" />
                        </div>
                      )}

                      <div>
                        <div className="font-bold text-slate-900 truncate max-w-xs">{file.fileName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          <span className="font-semibold text-slate-600">
                            {file.category === "DOKUMEN_PDF" && "Naskah PDF"}
                            {file.category === "PRESENTASI" && "Materi Presentasi"}
                            {file.category === "SIMULASI_RAW" && "Data Simulasi/Perhitungan"}
                          </span>
                          {" • "}
                          {new Date(file.uploadedAt).toLocaleDateString("id-ID")}
                        </div>
                        {file.notes && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5">"{file.notes}"</p>
                        )}
                      </div>
                    </div>

                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shrink-0 transition"
                    >
                      Buka Berkas <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal Tambah Laporan Progres */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">Tambah Laporan Progres Bimbingan</h3>
            <p className="text-slate-500 mb-4">Laporkan kemajuan penelitian, kendala, dan target minggu berikutnya.</p>

            <form onSubmit={handleCreateLog} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bimbingan Minggu Ke-</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={logForm.weekNumber}
                    onChange={(e) => setLogForm({ ...logForm, weekNumber: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={logForm.date}
                    onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Topik / Judul Capaian Minggu Ini</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Penyusunan Bab 3 Metodologi & Meshing 3D"
                  value={logForm.title}
                  onChange={(e) => setLogForm({ ...logForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rincian Progres yang Dikerjakan</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan secara detail apa yang sudah dikerjakan, simulasi yang sudah berjalan, rumus/analisis yang diselesaikan..."
                  value={logForm.summary}
                  onChange={(e) => setLogForm({ ...logForm, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kendala / Hambatan yang Dihadapi (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Kendala komputasi, software, keterbatasan data, atau bagian teori yang belum dipahami..."
                  value={logForm.blockers}
                  onChange={(e) => setLogForm({ ...logForm, blockers: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rencana Kerja Minggu Selanjutnya</label>
                <textarea
                  rows={2}
                  placeholder="Apa target yang akan diselesaikan untuk bimbingan minggu depan..."
                  value={logForm.nextPlan}
                  onChange={(e) => setLogForm({ ...logForm, nextPlan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingLog}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow transition disabled:opacity-50"
                >
                  {submittingLog ? "Menyimpan..." : "Kirim Laporan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upload Berkas */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Unggah Berkas & Data Penelitian</h3>
            <p className="text-slate-500 mb-4">
              Pilih kategori berkas dan metode unggah (Tautan Google Drive atau Upload Berkas).
            </p>

            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setUploadMode("driveLink")}
                className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
                  uploadMode === "driveLink" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" /> Tautan Google Drive
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
                  uploadMode === "file" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" /> Unggah File Langsung
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Berkas</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium"
                >
                  <option value="DOKUMEN_PDF">1. Dokumen Naskah / Proposal (.pdf)</option>
                  <option value="PRESENTASI">2. Slide Materi Presentasi (.pptx / .pdf)</option>
                  <option value="SIMULASI_RAW">3. File Raw Simulasi & Data Perhitungan (.zip, scripts, dataset)</option>
                </select>
              </div>

              {uploadMode === "driveLink" ? (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Berkas / Arsip</label>
                    <input
                      type="text"
                      required
                      placeholder="Misal: Raw_Simulation_Dataset_ANSYS.zip"
                      value={fileNameInput}
                      onChange={(e) => setFileNameInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tautan Berbagi Google Drive</label>
                    <input
                      type="url"
                      required
                      placeholder="https://drive.google.com/file/d/... atau https://drive.google.com/drive/folders/..."
                      value={driveUrlInput}
                      onChange={(e) => setDriveUrlInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Pastikan izin akses tautan diset ke "Siapa saja yang memiliki link" atau di-share ke email dosen.
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pilih Berkas Komputer</label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan / Keterangan Berkas (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: Script APDL pembebanan siklik dan spreadsheet validasi teori"
                  value={fileNotesInput}
                  onChange={(e) => setFileNotesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              {uploadMessage && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {uploadMessage}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingUpload}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow transition disabled:opacity-50"
                >
                  {submittingUpload ? "Memproses..." : "Simpan Berkas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
