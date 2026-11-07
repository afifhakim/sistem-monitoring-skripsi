import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateAuthUrl, isGoogleOAuthConfigured } from "@/lib/googleDrive";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "DOSEN") {
    return NextResponse.json({ error: "Akses khusus dosen pembimbing." }, { status: 403 });
  }

  const { origin } = new URL(request.url);
  const redirectUri = `${origin}/api/auth/google/callback`;

  const configured = isGoogleOAuthConfigured();
  if (!configured) {
    return NextResponse.json({
      isConfigured: false,
      message: "Kredensial GOOGLE_CLIENT_ID belum diset di .env.",
    });
  }

  try {
    const authUrl = generateAuthUrl(user.id, redirectUri);
    return NextResponse.json({ isConfigured: true, authUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
