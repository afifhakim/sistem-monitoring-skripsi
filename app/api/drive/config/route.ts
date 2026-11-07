import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readDatabase, writeDatabase } from "@/lib/db";
import { isGoogleDriveConfigured } from "@/lib/googleDrive";

export async function GET() {
  const user = await getCurrentUser();
  const db = readDatabase();

  return NextResponse.json({
    isDriveApiActive: isGoogleDriveConfigured(),
    mainDriveFolderUrl: db.settings?.mainDriveFolderUrl || "",
    isDosen: user?.role === "DOSEN",
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
    if (!db.settings) {
      db.settings = { dosenId: user.id };
    }
    db.settings.mainDriveFolderUrl = mainDriveFolderUrl;
    writeDatabase(db);

    return NextResponse.json({ message: "Link folder Google Drive utama berhasil diperbarui." });
  } catch (err: any) {
    return NextResponse.json({ error: "Gagal memperbarui konfigurasi." }, { status: 500 });
  }
}
