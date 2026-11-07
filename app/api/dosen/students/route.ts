import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readDatabase, writeDatabase, StudentStatus } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "DOSEN") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const yearFilter = searchParams.get("year");
  const statusFilter = searchParams.get("status");
  const search = searchParams.get("search")?.toLowerCase();

  const db = readDatabase();
  let students = db.users.filter((u) => u.role === "MAHASISWA");

  if (yearFilter && yearFilter !== "ALL") {
    students = students.filter((s) => s.academicYear === yearFilter);
  }

  if (statusFilter && statusFilter !== "ALL") {
    students = students.filter((s) => s.status === statusFilter);
  }

  if (search) {
    students = students.filter(
      (s) =>
        s.name.toLowerCase().includes(search) ||
        (s.nim && s.nim.toLowerCase().includes(search)) ||
        (s.thesisTitle && s.thesisTitle.toLowerCase().includes(search))
    );
  }

  const enriched = students.map((s) => {
    const logs = db.progressLogs.filter((l) => l.studentId === s.id);
    const files = db.files.filter((f) => f.studentId === s.id);
    const pendingLogs = logs.filter((l) => l.status === "MENUNGGU_REVIEW").length;

    return {
      id: s.id,
      name: s.name,
      nim: s.nim,
      email: s.email,
      academicYear: s.academicYear,
      thesisTitle: s.thesisTitle,
      topic: s.topic,
      status: s.status,
      driveFolderUrl: s.driveFolderUrl,
      createdAt: s.createdAt,
      logsCount: logs.length,
      pendingLogs,
      latestLog: logs[logs.length - 1] || null,
      files,
      logs,
    };
  });

  return NextResponse.json({ students: enriched });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "DOSEN") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  try {
    const { studentId, status, driveFolderUrl } = await request.json();
    if (!studentId) {
      return NextResponse.json({ error: "Student ID diperlukan." }, { status: 400 });
    }

    const db = readDatabase();
    const student = db.users.find((u) => u.id === studentId && u.role === "MAHASISWA");
    if (!student) {
      return NextResponse.json({ error: "Mahasiswa tidak ditemukan." }, { status: 404 });
    }

    if (status) {
      student.status = status as StudentStatus;
    }
    if (driveFolderUrl !== undefined) {
      student.driveFolderUrl = driveFolderUrl;
    }

    writeDatabase(db);
    return NextResponse.json({ message: "Data mahasiswa berhasil diperbarui.", student });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memperbarui data." }, { status: 500 });
  }
}
