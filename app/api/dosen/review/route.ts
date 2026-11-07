import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readDatabase, writeDatabase, LogStatus } from "@/lib/db";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "DOSEN") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  try {
    const { logId, status, dosenNotes } = await request.json();

    if (!logId || !status) {
      return NextResponse.json({ error: "Log ID dan status diperlukan." }, { status: 400 });
    }

    const db = readDatabase();
    const log = db.progressLogs.find((l) => l.id === logId);

    if (!log) {
      return NextResponse.json({ error: "Catatan bimbingan/progres tidak ditemukan." }, { status: 404 });
    }

    log.status = status as LogStatus;
    log.dosenNotes = dosenNotes || "";
    log.reviewedAt = new Date().toISOString();

    writeDatabase(db);
    return NextResponse.json({ message: "Review berhasil disimpan.", log });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal menyimpan review." }, { status: 500 });
  }
}
