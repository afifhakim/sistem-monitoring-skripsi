import { NextRequest, NextResponse } from "next/server";
import { readDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export interface Notification {
  id: string;
  type: "OVERDUE" | "APPROACHING" | "INFO";
  title: string;
  message: string;
  studentName?: string;
  nim?: string;
  deadlineDate: string;
  revisionType: string;
  deadlineId: string;
  isCompleted: boolean;
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = readDatabase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  let relevantDeadlines: typeof db.revisionDeadlines = [];

  if (user.role === "DOSEN") {
    relevantDeadlines = db.revisionDeadlines.filter(
      (d) => d.dosenId === user.id && !d.isCompleted
    );
  } else {
    // MAHASISWA
    relevantDeadlines = db.revisionDeadlines.filter(
      (d) => d.studentId === user.id && !d.isCompleted
    );
  }

  const notifications: Notification[] = relevantDeadlines.map((d) => {
    const deadline = new Date(d.deadlineDate);
    deadline.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const revisionLabel = d.type === "PROPOSAL" ? "Revisi Sidang Proposal" : "Revisi Sidang Akhir (Skripsi)";

    if (diffDays < 0) {
      return {
        id: d.id,
        type: "OVERDUE" as const,
        title: `⚠️ Revisi Terlambat: ${revisionLabel}`,
        message:
          user.role === "DOSEN"
            ? `Deadline revisi ${revisionLabel} untuk mahasiswa ${d.studentName} (${d.nim}) sudah terlewat ${Math.abs(diffDays)} hari! Deadline: ${new Date(d.deadlineDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}.`
            : `Deadline ${revisionLabel} Anda sudah terlewat ${Math.abs(diffDays)} hari! Deadline: ${new Date(d.deadlineDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}. Segera hubungi dosen pembimbing.`,
        studentName: d.studentName,
        nim: d.nim,
        deadlineDate: d.deadlineDate,
        revisionType: d.type,
        deadlineId: d.id,
        isCompleted: false,
      };
    } else if (diffDays <= 3) {
      return {
        id: d.id,
        type: "APPROACHING" as const,
        title: `🔔 Deadline Revisi Mendekat: ${revisionLabel}`,
        message:
          user.role === "DOSEN"
            ? `Deadline revisi ${revisionLabel} untuk mahasiswa ${d.studentName} (${d.nim}) tinggal ${diffDays} hari lagi. Deadline: ${new Date(d.deadlineDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}.`
            : `Deadline ${revisionLabel} Anda tinggal ${diffDays} hari lagi! Deadline: ${new Date(d.deadlineDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}. Pastikan revisi selesai tepat waktu.`,
        studentName: d.studentName,
        nim: d.nim,
        deadlineDate: d.deadlineDate,
        revisionType: d.type,
        deadlineId: d.id,
        isCompleted: false,
      };
    } else {
      return {
        id: d.id,
        type: "INFO" as const,
        title: `📋 Deadline Revisi: ${revisionLabel}`,
        message:
          user.role === "DOSEN"
            ? `Revisi ${revisionLabel} untuk ${d.studentName} (${d.nim}) deadline pada ${new Date(d.deadlineDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}.`
            : `Deadline ${revisionLabel} Anda pada ${new Date(d.deadlineDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}.`,
        studentName: d.studentName,
        nim: d.nim,
        deadlineDate: d.deadlineDate,
        revisionType: d.type,
        deadlineId: d.id,
        isCompleted: false,
      };
    }
  });

  // Sort: OVERDUE first, then APPROACHING, then INFO
  const order: Record<string, number> = { OVERDUE: 0, APPROACHING: 1, INFO: 2 };
  notifications.sort((a, b) => order[a.type] - order[b.type]);

  return NextResponse.json({ notifications, count: notifications.filter(n => n.type !== "INFO").length });
}
