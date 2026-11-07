import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readDatabase } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "DOSEN") {
    return NextResponse.json({ error: "Akses ditolak. Khusus dosen pembimbing." }, { status: 403 });
  }

  const db = readDatabase();
  const students = db.users.filter((u) => u.role === "MAHASISWA");

  // Breakdown per Academic Year
  const yearMap: { [year: string]: number } = {};
  students.forEach((s) => {
    const yr = s.academicYear || "Belum Ditentukan";
    yearMap[yr] = (yearMap[yr] || 0) + 1;
  });

  const byYear = Object.entries(yearMap)
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year.localeCompare(b.year));

  // Breakdown per Status
  const byStatus = {
    PROPOSAL: 0,
    PENELITIAN: 0,
    SEMINAR_HASIL: 0,
    SIDANG: 0,
    LULUS: 0,
  };

  students.forEach((s) => {
    if (s.status && byStatus[s.status] !== undefined) {
      byStatus[s.status]++;
    }
  });

  // Pending Reviews
  const pendingReviews = db.progressLogs.filter((log) => log.status === "MENUNGGU_REVIEW").length;

  // File stats
  const fileStats = {
    pdf: db.files.filter((f) => f.category === "DOKUMEN_PDF").length,
    presentation: db.files.filter((f) => f.category === "PRESENTASI").length,
    rawSimulation: db.files.filter((f) => f.category === "SIMULASI_RAW").length,
    total: db.files.length,
  };

  return NextResponse.json({
    totalStudents: students.length,
    byYear,
    byStatus,
    pendingReviews,
    fileStats,
    mainDriveFolderUrl: db.settings?.mainDriveFolderUrl || "",
    years: Array.from(new Set(students.map((s) => s.academicYear).filter(Boolean))),
  });
}
