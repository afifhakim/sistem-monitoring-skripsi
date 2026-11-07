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
      const isConnecting = Boolean(mainDriveFolderUrl && mainDriveFolderUrl.trim().length > 0);
      dosen.driveAuth = {
        connected: isConnecting,
        googleEmail: isConnecting ? (dosen.driveAuth?.googleEmail || dosen.email) : undefined,
        mainFolderUrl: isConnecting ? mainDriveFolderUrl.trim() : "",
        connectedAt: isConnecting ? new Date().toISOString() : undefined,
      };
      writeDatabase(db);
    }

    return NextResponse.json({
      message: mainDriveFolderUrl?.trim()
        ? "Google Drive berhasil dihubungkan!"
        : "Konfigurasi Google Drive berhasil direset.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Gagal memperbarui konfigurasi." }, { status: 500 });
  }
}
