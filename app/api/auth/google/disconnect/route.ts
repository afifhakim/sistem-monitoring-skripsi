import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readDatabase, writeDatabase } from "@/lib/db";

export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== "DOSEN") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const db = readDatabase();
  const dosen = db.users.find((u) => u.id === user.id && u.role === "DOSEN");

  if (dosen && dosen.driveAuth) {
    dosen.driveAuth.connected = false;
    dosen.driveAuth.accessToken = undefined;
    dosen.driveAuth.refreshToken = undefined;
    dosen.driveAuth.googleEmail = undefined;
    writeDatabase(db);
  }

  return NextResponse.json({ message: "Google Drive berhasil diputus." });
}
