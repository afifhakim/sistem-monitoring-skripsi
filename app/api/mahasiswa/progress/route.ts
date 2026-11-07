import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readDatabase, writeDatabase, ProgressLog } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "MAHASISWA") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const db = readDatabase();
  const logs = db.progressLogs
    .filter((l) => l.studentId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const files = db.files
    .filter((f) => f.studentId === user.id)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  return NextResponse.json({ logs, files, user });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "MAHASISWA") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  try {
    const { weekNumber, date, title, summary, blockers, nextPlan } = await request.json();

    if (!title || !summary) {
      return NextResponse.json({ error: "Judul dan ringkasan progres wajib diisi." }, { status: 400 });
    }

    const db = readDatabase();
    const newLog: ProgressLog = {
      id: `log-${Date.now()}`,
      studentId: user.id,
      dosenId: user.dosenId || "usr-afif-hakim",
      studentName: user.name,
      nim: user.nim || "-",
      academicYear: user.academicYear || "Belum Ditentukan",
      weekNumber: Number(weekNumber) || 1,
      date: date || new Date().toISOString().split("T")[0],
      title,
      summary,
      blockers: blockers || "Tidak ada kendala berarti.",
      nextPlan: nextPlan || "Melanjutkan target penelitian bab selanjutnya.",
      status: "MENUNGGU_REVIEW",
      createdAt: new Date().toISOString(),
    };

    db.progressLogs.push(newLog);
    writeDatabase(db);

    return NextResponse.json({ message: "Laporan progres berhasil disimpan.", log: newLog });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal menyimpan laporan progres." }, { status: 500 });
  }
}
