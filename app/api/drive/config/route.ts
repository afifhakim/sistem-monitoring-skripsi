import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readDatabase, writeDatabase } from "@/lib/db";
import { isGoogleOAuthConfigured } from "@/lib/googleDrive";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = readDatabase();
  const currentDosen = db.users.find((u) => u.id === user.id);
  const driveAuth = currentDosen?.driveAuth || { connected: false };

  return NextResponse.json({
    isOAuthConfigured: isGoogleOAuthConfigured(),
    driveAuth: {
      connected: Boolean(driveAuth.connected),
      googleEmail: driveAuth.googleEmail || "",
      mainFolderUrl: driveAuth.mainFolderUrl || "",
    },
    isDosen: user.role === "DOSEN",
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "DOSEN") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  try {
    const { mainDriveFolderUrl } = await request.json();
    const db = readDatabase();
    const dosen = db.users.find((u) => u.id === user.id && u.role === "DOSEN");

    if (dosen) {
      if (!dosen.driveAuth) {
        dosen.driveAuth = { connected: false };
      }
      dosen.driveAuth.mainFolderUrl = mainDriveFolderUrl;
      writeDatabase(db);
    }

    return NextResponse.json({ message: "Link folder Google Drive utama berhasil diperbarui." });
  } catch (err: any) {
    return NextResponse.json({ error: "Gagal memperbarui konfigurasi." }, { status: 500 });
  }
}
