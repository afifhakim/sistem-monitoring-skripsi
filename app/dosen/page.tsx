"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  FileText,
  FileCode,
  FileSpreadsheet,
  ExternalLink,
  Search,
  Filter,
  LogOut,
  ChevronRight,
  MessageSquare,
  Settings,
  Sparkles,
  RefreshCw,
  FolderGit2,
} from "lucide-react";

interface Stats {
  totalStudents: number;
  byYear: { year: string; count: number }[];
  byStatus: { [status: string]: number };
  pendingReviews: number;
  fileStats: { pdf: number; presentation: number; rawSimulation: number; total: number };
  mainDriveFolderUrl: string;
  years: string[];
}

interface Student {
  id: string;
  name: string;
  nim: string;
  email: string;
  academicYear: string;
  thesisTitle: string;
  topic: string;
  status: string;
  driveFolderUrl?: string;
  createdAt: string;
  logsCount: number;
  pendingLogs: number;
  files: any[];
  logs: any[];
}

export default function DosenDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal Detail Mahasiswa
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<"logs" | "files">("logs");

  // Modal Review Logbook
  const [reviewingLog, setReviewingLog] = useState<any | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"DISETUJUI" | "PERLU_REVISI">("DISETUJUI");
  const [dosenNotes, setDosenNotes] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Settings / Drive Modal
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveUrlInput, setDriveUrlInput] = useState("");
  const [savingDriveUrl, setSavingDriveUrl] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, studentsRes] = await Promise.all([
        fetch("/api/dosen/stats"),
        fetch(`/api/dosen/students?year=${selectedYear}&status=${selectedStatus}&search=${searchQuery}`),
      ]);

      if (statsRes.status === 401 || statsRes.status === 403) {
        router.push("/login");
        return;
      }

      const statsData = await statsRes.json();
      const studentsData = await studentsRes.json();

      setStats(statsData);
      setStudents(studentsData.students || []);
      if (statsData.mainDriveFolderUrl && !driveUrlInput) {
        setDriveUrlInput(statsData.mainDriveFolderUrl);
      }
    } catch (err) {
      console.error("Gagal memuat data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleStatusChange = async (studentId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/dosen/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, status: newStatus }),
      });
      if (res.ok) {
        fetchData();
        if (selectedStudent && selectedStudent.id === studentId) {
          setSelectedStudent({ ...selectedStudent, status: newStatus });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingLog) return;
    setReviewSubmitting(true);

    try {
      const res = await fetch("/api/dosen/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logId: reviewingLog.id,
          status: reviewStatus,
          dosenNotes,
        }),
      });

      if (res.ok) {
        setReviewingLog(null);
        setDosenNotes("");
        fetchData();
        // Update selectedStudent logs
        if (selectedStudent) {
          const updatedLogs = selectedStudent.logs.map((l) =>
            l.id === reviewingLog.id
              ? { ...l, status: reviewStatus, dosenNotes, reviewedAt: new Date().toISOString() }
              : l
          );
          setSelectedStudent({ ...selectedStudent, logs: updatedLogs });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleSaveDriveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDriveUrl(true);
    try {
      const res = await fetch("/api/drive/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mainDriveFolderUrl: driveUrlInput }),
      });
      if (res.ok) {
        setShowDriveModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingDriveUrl(false);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base leading-tight">Dashboard Dosen Pembimbing</h1>
              <p className="text-[11px] text-slate-400">Monitoring Mahasiswa Skripsi & Repositori Berkas</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setShowDriveModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
              title="Pengaturan Google Drive"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Folder Google Drive</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-xs font-medium text-rose-300 border border-rose-800/50 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* KPI & Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Bimbingan</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats?.totalStudents || 0}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Seluruh Angkatan</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Butuh Review</p>
                <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{stats?.pendingReviews || 0}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Logbook Menunggu Feedback</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Telah Lulus</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{stats?.byStatus?.LULUS || 0}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Skripsi Selesai</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Berkas Terunggah</p>
                <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{stats?.fileStats?.total || 0}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {stats?.fileStats?.pdf || 0} PDF, {stats?.fileStats?.presentation || 0} PPT, {stats?.fileStats?.rawSimulation || 0} Raw
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <FileCode className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Mahasiswa per Tahun (Distribution Chart) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Distribusi Mahasiswa Pendaftar per Tahun</h2>
              <p className="text-xs text-slate-500">Melihat perbandingan jumlah mahasiswa bimbingan yang mendaftar di Anda setiap tahun akademik</p>
            </div>
            {stats?.mainDriveFolderUrl && (
              <a
                href={stats.mainDriveFolderUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-medium border border-amber-200 transition"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                Buka Google Drive Utama
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
            {stats?.byYear.map((item) => {
              const maxCount = Math.max(...(stats?.byYear.map((y) => y.count) || [1]), 1);
              const percent = Math.round((item.count / maxCount) * 100);
              const isSelected = selectedYear === item.year;

              return (
                <div
                  key={item.year}
                  onClick={() => setSelectedYear(isSelected ? "ALL" : item.year)}
                  className={`cursor-pointer rounded-xl p-4 border transition ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20"
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-700">{item.year}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-indigo-600 shadow-sm">
                      {item.count} Mhs
                    </span>
                  </div>
                  {/* Progress bar visual */}
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-3 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>

            {/* Filter Tahun */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Tahun Akademik</option>
              {stats?.years.map((y) => (
                <option key={y} value={y}>
                  Tahun {y}
                </option>
              ))}
            </select>

            {/* Filter Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Tahapan Status</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="PENELITIAN">Penelitian</option>
              <option value="SEMINAR_HASIL">Seminar Hasil</option>
              <option value="SIDANG">Sidang Akhir</option>
              <option value="LULUS">Lulus</option>
            </select>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-72">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama / NIM / topik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition"
            >
              Cari
            </button>
          </form>
        </div>

        {/* Students Table / Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              Daftar Mahasiswa Bimbingan ({students.length})
            </h3>
            <button
              onClick={fetchData}
              className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Segarkan Data
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Memuat data mahasiswa...</div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Tidak ada data mahasiswa dengan kriteria filter ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Mahasiswa & NIM</th>
                    <th className="py-3 px-4">Tahun Angkatan</th>
                    <th className="py-3 px-4">Judul & Topik Skripsi</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Logbook & Berkas</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{student.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{student.nim}</div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-[11px]">
                          {student.academicYear}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-800 truncate" title={student.thesisTitle}>
                          {student.thesisTitle}
                        </div>
                        <div className="text-[11px] text-indigo-600 mt-0.5">{student.topic || "-"}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(student.status)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500">
                            {student.logsCount} logbook
                          </span>
                          {student.pendingLogs > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                              {student.pendingLogs} butuh review
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400">
                            • {student.files.length} berkas
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setActiveTab("logs");
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs transition"
                        >
                          Detail & Berkas
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Detail Mahasiswa */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{selectedStudent.name}</h3>
                  <span className="font-mono text-xs text-indigo-300">({selectedStudent.nim})</span>
                  {getStatusBadge(selectedStudent.status)}
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">{selectedStudent.thesisTitle}</p>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
                  <span>Angkatan: <strong className="text-white">{selectedStudent.academicYear}</strong></span>
                  <span>Topik: <strong className="text-white">{selectedStudent.topic}</strong></span>
                  {selectedStudent.driveFolderUrl && (
                    <a
                      href={selectedStudent.driveFolderUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-amber-400 hover:underline"
                    >
                      <FolderOpen className="w-3.5 h-3.5" /> Folder Drive Mahasiswa
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Quick Change Status Bar */}
            <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Perbarui Status Skripsi Mahasiswa:</span>
              <div className="flex gap-1.5">
                {["PROPOSAL", "PENELITIAN", "SEMINAR_HASIL", "SIDANG", "LULUS"].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedStudent.id, st)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                      selectedStudent.status === st
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="px-6 border-b border-slate-200 flex gap-6 text-xs font-semibold text-slate-500">
              <button
                onClick={() => setActiveTab("logs")}
                className={`py-3 border-b-2 flex items-center gap-2 transition ${
                  activeTab === "logs"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent hover:text-slate-700"
                }`}
              >
                <FileText className="w-4 h-4" /> Riwayat Logbook & Bimbingan ({selectedStudent.logs.length})
              </button>
              <button
                onClick={() => setActiveTab("files")}
                className={`py-3 border-b-2 flex items-center gap-2 transition ${
                  activeTab === "files"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent hover:text-slate-700"
                }`}
              >
                <FolderOpen className="w-4 h-4" /> Berkas Terunggah & Raw Data ({selectedStudent.files.length})
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 text-xs">
              {activeTab === "logs" ? (
                <div className="space-y-4">
                  {selectedStudent.logs.length === 0 ? (
                    <p className="text-center py-8 text-slate-400">Belum ada catatan logbook dari mahasiswa ini.</p>
                  ) : (
                    selectedStudent.logs.map((log: any) => (
                      <div
                        key={log.id}
                        className={`p-4 rounded-xl border ${
                          log.status === "MENUNGGU_REVIEW"
                            ? "bg-amber-50/40 border-amber-300"
                            : log.status === "PERLU_REVISI"
                            ? "bg-rose-50/40 border-rose-200"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                          <div>
                            <span className="font-bold text-slate-900 text-sm">
                              Minggu ke-{log.weekNumber}: {log.title}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-2 font-mono">({log.date})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {log.status === "MENUNGGU_REVIEW" && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                Butuh Review
                              </span>
                            )}
                            {log.status === "DISETUJUI" && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Disetujui
                              </span>
                            )}
                            {log.status === "PERLU_REVISI" && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                Perlu Revisi
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setReviewingLog(log);
                                setReviewStatus(log.status === "PERLU_REVISI" ? "PERLU_REVISI" : "DISETUJUI");
                                setDosenNotes(log.dosenNotes || "");
                              }}
                              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] transition"
                            >
                              Beri Catatan / Review
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div>
                            <strong className="text-slate-700 block">Progres yang dikerjakan:</strong>
                            <p className="text-slate-600 mt-0.5 whitespace-pre-wrap">{log.summary}</p>
                          </div>

                          {log.blockers && (
                            <div>
                              <strong className="text-rose-700 block">Kendala / Hambatan:</strong>
                              <p className="text-slate-600 mt-0.5 whitespace-pre-wrap">{log.blockers}</p>
                            </div>
                          )}

                          {log.nextPlan && (
                            <div>
                              <strong className="text-indigo-700 block">Rencana Selanjutnya:</strong>
                              <p className="text-slate-600 mt-0.5 whitespace-pre-wrap">{log.nextPlan}</p>
                            </div>
                          )}

                          {log.dosenNotes && (
                            <div className="mt-3 p-3 rounded-lg bg-indigo-50/80 border border-indigo-200">
                              <strong className="text-indigo-900 block flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5" /> Catatan & Arahan Pembimbing:
                              </strong>
                              <p className="text-indigo-950 mt-1 whitespace-pre-wrap">{log.dosenNotes}</p>
                              {log.reviewedAt && (
                                <span className="text-[10px] text-indigo-400 mt-1 block">
                                  Ditanggapi pada: {new Date(log.reviewedAt).toLocaleDateString("id-ID")}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* Tab Files (Categorized: PDF, Presentation, Raw Simulation) */
                <div className="space-y-6">
                  {/* Category 1: PDF Documents */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 text-rose-700">
                      <FileText className="w-4 h-4" /> 1. Dokumen Naskah & Laporan (.pdf)
                    </h4>
                    <div className="space-y-2">
                      {selectedStudent.files.filter((f) => f.category === "DOKUMEN_PDF").length === 0 ? (
                        <p className="text-slate-400 italic text-[11px]">Belum ada dokumen PDF yang diunggah.</p>
                      ) : (
                        selectedStudent.files
                          .filter((f) => f.category === "DOKUMEN_PDF")
                          .map((file) => (
                            <div
                              key={file.id}
                              className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between hover:border-slate-300"
                            >
                              <div className="flex items-center gap-2.5">
                                <FileText className="w-5 h-5 text-rose-600 shrink-0" />
                                <div>
                                  <a
                                    href={file.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-bold text-slate-900 hover:text-indigo-600 hover:underline"
                                  >
                                    {file.fileName}
                                  </a>
                                  <div className="text-[11px] text-slate-400">
                                    {new Date(file.uploadedAt).toLocaleDateString("id-ID")}
                                    {file.notes && ` • "${file.notes}"`}
                                  </div>
                                </div>
                              </div>
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-medium text-[11px] flex items-center gap-1 transition"
                              >
                                Buka Berkas <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  {/* Category 2: Presentations */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 text-amber-700">
                      <FileSpreadsheet className="w-4 h-4" /> 2. Slide Materi Presentasi (.pptx / .pdf)
                    </h4>
                    <div className="space-y-2">
                      {selectedStudent.files.filter((f) => f.category === "PRESENTASI").length === 0 ? (
                        <p className="text-slate-400 italic text-[11px]">Belum ada slide presentasi yang diunggah.</p>
                      ) : (
                        selectedStudent.files
                          .filter((f) => f.category === "PRESENTASI")
                          .map((file) => (
                            <div
                              key={file.id}
                              className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between hover:border-slate-300"
                            >
                              <div className="flex items-center gap-2.5">
                                <FileSpreadsheet className="w-5 h-5 text-amber-600 shrink-0" />
                                <div>
                                  <a
                                    href={file.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-bold text-slate-900 hover:text-indigo-600 hover:underline"
                                  >
                                    {file.fileName}
                                  </a>
                                  <div className="text-[11px] text-slate-400">
                                    {new Date(file.uploadedAt).toLocaleDateString("id-ID")}
                                    {file.notes && ` • "${file.notes}"`}
                                  </div>
                                </div>
                              </div>
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-medium text-[11px] flex items-center gap-1 transition"
                              >
                                Buka Berkas <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  {/* Category 3: Raw Simulation Files & Calculations */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 text-blue-700">
                      <FileCode className="w-4 h-4" /> 3. File Raw Simulasi & Data Perhitungan (.zip, scripts, dataset)
                    </h4>
                    <div className="space-y-2">
                      {selectedStudent.files.filter((f) => f.category === "SIMULASI_RAW").length === 0 ? (
                        <p className="text-slate-400 italic text-[11px]">Belum ada file simulasi yang diunggah.</p>
                      ) : (
                        selectedStudent.files
                          .filter((f) => f.category === "SIMULASI_RAW")
                          .map((file) => (
                            <div
                              key={file.id}
                              className="p-3 rounded-lg border border-blue-200 bg-blue-50/30 flex items-center justify-between hover:border-blue-300"
                            >
                              <div className="flex items-center gap-2.5">
                                <FileCode className="w-5 h-5 text-blue-600 shrink-0" />
                                <div>
                                  <a
                                    href={file.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-bold text-slate-900 hover:text-blue-700 hover:underline"
                                  >
                                    {file.fileName}
                                  </a>
                                  <div className="text-[11px] text-slate-500">
                                    {file.isDriveDirectLink && <span className="font-semibold text-amber-700">[Google Drive] </span>}
                                    {new Date(file.uploadedAt).toLocaleDateString("id-ID")}
                                    {file.notes && ` • "${file.notes}"`}
                                  </div>
                                </div>
                              </div>
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] flex items-center gap-1 transition shadow-sm"
                              >
                                Akses Raw Data <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 font-semibold text-slate-700 text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Review Logbook */}
      {reviewingLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Review Bimbingan: Minggu ke-{reviewingLog.weekNumber}
            </h3>
            <p className="text-slate-500 mb-4 font-medium">{reviewingLog.title}</p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Keputusan Status:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStatus("DISETUJUI")}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition ${
                      reviewStatus === "DISETUJUI"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus("PERLU_REVISI")}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition ${
                      reviewStatus === "PERLU_REVISI"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Perlu Revisi
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Catatan, Koreksi, atau Arahan Pembimbing:
                </label>
                <textarea
                  rows={4}
                  required
                  value={dosenNotes}
                  onChange={(e) => setDosenNotes(e.target.value)}
                  placeholder="Tuliskan arahan perbaikan model simulasi, bab yang harus direvisi, atau tugas berikutnya..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingLog(null)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow transition disabled:opacity-50"
                >
                  {reviewSubmitting ? "Menyimpan..." : "Simpan Hasil Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pengaturan Google Drive */}
      {showDriveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-xs">
            <div className="flex items-center gap-2 mb-2 text-indigo-600">
              <FolderOpen className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Pengaturan Folder Google Drive Utama</h3>
            </div>
            <p className="text-slate-500 leading-relaxed mb-4">
              Masukkan tautan Google Drive utama Anda (folder tempat seluruh berkas skripsi mahasiswa disimpan).
              Tautan ini akan dapat diakses dari dashboard Anda untuk memeriksa folder mahasiswa per tahun akademik.
            </p>

            <form onSubmit={handleSaveDriveUrl} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tautan Folder Google Drive Utama:
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={driveUrlInput}
                  onChange={(e) => setDriveUrlInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-mono text-xs"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 leading-relaxed">
                <strong className="block mb-1">💡 Tips Sinkronisasi Otomatis:</strong>
                Untuk mengaktifkan unggah otomatis langsung via sistem ke Google Drive, Anda juga dapat menambahkan kredensial Google Service Account di berkas <code className="bg-amber-100 px-1 rounded">.env</code>.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDriveModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={savingDriveUrl}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow transition disabled:opacity-50"
                >
                  {savingDriveUrl ? "Menyimpan..." : "Simpan Tautan Drive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
