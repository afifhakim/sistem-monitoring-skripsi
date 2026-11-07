import { NextResponse } from "next/server";
import { readDatabase, writeDatabase } from "@/lib/db";
import { exchangeCodeForTokens, createDosenRootFolder } from "@/lib/googleDrive";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const dosenId = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const origin = url.origin;
  const redirectUri = `${origin}/api/auth/google/callback`;

  if (error || !code || !dosenId) {
    return NextResponse.redirect(`${origin}/dosen?drive_error=${encodeURIComponent(error || "Akses dibatalkan")}`);
  }

  try {
    const { tokens, googleEmail } = await exchangeCodeForTokens(code, redirectUri);
    const db = readDatabase();
    const dosen = db.users.find((u) => u.id === dosenId && u.role === "DOSEN");

    if (!dosen) {
      return NextResponse.redirect(`${origin}/dosen?drive_error=DosenNotFound`);
    }

    // Buat folder utama skripsi di Google Drive dosen tersebut
    const rootFolder = await createDosenRootFolder(tokens, dosen.name);

    dosen.driveAuth = {
      connected: true,
      googleEmail: googleEmail || "",
      accessToken: tokens.access_token || undefined,
      refreshToken: tokens.refresh_token || undefined,
      expiryDate: tokens.expiry_date || undefined,
      mainFolderId: rootFolder?.folderId || "",
      mainFolderUrl: rootFolder?.folderUrl || "",
      connectedAt: new Date().toISOString(),
    };

    writeDatabase(db);

    return NextResponse.redirect(`${origin}/dosen?drive_success=true`);
  } catch (err: any) {
    console.error("Callback error:", err);
    return NextResponse.redirect(`${origin}/dosen?drive_error=${encodeURIComponent(err.message || "Gagal menghubungkan Drive")}`);
  }
}
