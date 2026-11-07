import { NextRequest, NextResponse } from "next/server";
import { readDatabase, writeDatabase, RevisionDeadline } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// GET: Ambil semua deadline revisi untuk mahasiswa tertentu (atau semua mahasiswa dosen)
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "DOSEN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = readDatabase();
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  let deadlines = db.revisionDeadlines.filter((d) => d.dosenId === user.id);
  if (studentId) {
    deadlines = deadlines.filter((d) => d.studentId === studentId);
  }

  // Sort by deadlineDate desc
  deadlines.sort((a, b) => new Date(b.deadlineDate).getTime() - new Date(a.deadlineDate).getTime());

  return NextResponse.json({ deadlines });
}

// POST: Dosen membuat deadline revisi baru
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "DOSEN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { studentId, type, deadlineDate, notes } = body;

  if (!studentId || !type || !deadlineDate) {
    return NextResponse.json({ error: "studentId, type, dan deadlineDate wajib diisi" }, { status: 400 });
  }

  const db = readDatabase();
  const student = db.users.find((u) => u.id === studentId && u.dosenId === user.id);
  if (!student) {
    return NextResponse.json({ error: "Mahasiswa tidak ditemukan" }, { status: 404 });
  }

  const newDeadline: RevisionDeadline = {
    id: `rev-${randomUUID()}`,
    studentId,
    dosenId: user.id,
    studentName: student.name || "",
    nim: student.nim || "",
    academicYear: student.academicYear || "",
    type,
    deadlineDate,
    notes: notes || "",
    isCompleted: false,
    createdAt: new Date().toISOString(),
  };

  db.revisionDeadlines.push(newDeadline);
  writeDatabase(db);

  return NextResponse.json({ deadline: newDeadline });
}

// PATCH: Update deadline (tandai selesai atau update tanggal)
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "DOSEN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { deadlineId, isCompleted, deadlineDate, notes } = body;

  const db = readDatabase();
  const idx = db.revisionDeadlines.findIndex((d) => d.id === deadlineId && d.dosenId === user.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Deadline tidak ditemukan" }, { status: 404 });
  }

  if (typeof isCompleted === "boolean") {
    db.revisionDeadlines[idx].isCompleted = isCompleted;
    if (isCompleted) {
      db.revisionDeadlines[idx].completedAt = new Date().toISOString();
    } else {
      delete db.revisionDeadlines[idx].completedAt;
    }
  }
  if (deadlineDate) db.revisionDeadlines[idx].deadlineDate = deadlineDate;
  if (notes !== undefined) db.revisionDeadlines[idx].notes = notes;

  writeDatabase(db);
  return NextResponse.json({ deadline: db.revisionDeadlines[idx] });
}
