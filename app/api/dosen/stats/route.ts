import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readDatabase } from "@/lib/db";
import { isGoogleOAuthConfigured } from "@/lib/googleDrive";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "DOSEN") {
    return NextResponse.json({ error: "Akses ditolak. Khusus dosen pembimbing." }, { status: 403 });
  }

  const db = readDatabase();
  // Filter mahasiswa khusus bimbingan dosen ini
  const students = db.users.filter(
    (u) => u.role === "MAHASISWA" && (u.dosenId === user.id || (!u.dosenId && user.id === "usr-afif-hakim"))
  );

  const studentIds = students.map((s) => s.id);

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

  // Pending Reviews untuk mahasiswa dosen ini
  const relevantLogs = db.progressLogs.filter((log) => studentIds.includes(log.studentId));
  const pendingReviews = relevantLogs.filter((log) => log.status === "MENUNGGU_REVIEW").length;

  // File stats
  const relevantFiles = db.files.filter((f) => studentIds.includes(f.studentId));
  const fileStats = {
    pdf: relevantFiles.filter((f) => f.category === "DOKUMEN_PDF").length,
    presentation: relevantFiles.filter((f) => f.category === "PRESENTASI").length,
    rawSimulation: relevantFiles.filter((f) => f.category === "SIMULASI_RAW").length,
    total: relevantFiles.length,
  };

  // Google Drive info dosen saat ini
  const currentDosen = db.users.find((u) => u.id === user.id) || user;
  const driveAuth = currentDosen.driveAuth || { connected: false };

  return NextResponse.json({
    dosenName: currentDosen.name,
    dosenEmail: currentDosen.email,
    totalStudents: students.length,
    byYear,
    byStatus,
    pendingReviews,
    fileStats,
    driveAuth: {
      connected: Boolean(driveAuth.connected || (driveAuth.mainFolderUrl && driveAuth.mainFolderUrl.trim().length > 0)),
      googleEmail: driveAuth.googleEmail || (driveAuth.mainFolderUrl ? currentDosen.email : ""),
      mainFolderUrl: driveAuth.mainFolderUrl || "",
      connectedAt: driveAuth.connectedAt || "",
    },
    isOAuthConfigured: isGoogleOAuthConfigured(),
    years: Array.from(new Set(students.map((s) => s.academicYear).filter(Boolean))),
  });
}
