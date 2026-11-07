import { google } from "googleapis";
import { Readable } from "stream";

export interface DriveUploadResult {
  fileId: string;
  name: string;
  webViewLink: string;
  size?: number;
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function getOAuth2Client(redirectUri?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Menghasilkan URL izin (Consent Screen) Google OAuth 2.0 untuk Dosen
 */
export function generateAuthUrl(dosenId: string, redirectUri: string): string {
  const oauth2Client = getOAuth2Client(redirectUri);
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    state: dosenId,
  });
}

/**
 * Menukar authorization code dari Google menjadi access & refresh tokens
 */
export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const oauth2Client = getOAuth2Client(redirectUri);
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Ambil info email akun Google dosen
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();

  return {
    tokens,
    googleEmail: userInfo.data.email || undefined,
  };
}

/**
 * Membuat folder utama bimbingan di Google Drive dosen setelah login
 */
export async function createDosenRootFolder(tokens: any, dosenName: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const safeDosenName = dosenName.replace(/[^a-zA-Z0-9 ]/g, "").trim();
  const folderName = `Skripsi_Bimbingan_${safeDosenName || "Dosen"}`;

  try {
    // Cek apakah sudah pernah ada folder dengan nama ini
    const existing = await drive.files.list({
      q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id, name, webViewLink)",
      spaces: "drive",
    });

    if (existing.data.files && existing.data.files.length > 0) {
      const found = existing.data.files[0];
      return {
        folderId: found.id!,
        folderUrl: found.webViewLink || `https://drive.google.com/drive/folders/${found.id}`,
      };
    }

    const created = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id, name, webViewLink",
    });

    // Beri izin view jika ada tautan
    if (created.data.id) {
      try {
        await drive.permissions.create({
          fileId: created.data.id,
          requestBody: { role: "reader", type: "anyone" },
        });
      } catch (e) {
        // Abaikan jika restricted oleh domain kampus
      }
    }

    return {
      folderId: created.data.id!,
      folderUrl: created.data.webViewLink || `https://drive.google.com/drive/folders/${created.data.id}`,
    };
  } catch (err) {
    console.error("Gagal membuat folder di Google Drive dosen:", err);
    return null;
  }
}

/**
 * Mencari atau membuat subfolder di Google Drive dosen
 */
export async function getOrCreateSubfolder(tokens: any, folderName: string, parentId?: string): Promise<string | null> {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }

    const res = await drive.files.list({
      q: query,
      fields: "files(id, name)",
      spaces: "drive",
    });

    if (res.data.files && res.data.files.length > 0) {
      return res.data.files[0].id!;
    }

    const created = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: parentId ? [parentId] : undefined,
      },
      fields: "id, name",
    });

    return created.data.id || null;
  } catch (err) {
    console.error("Error getOrCreateSubfolder:", err);
    return null;
  }
}

/**
 * Mengunggah berkas mahasiswa langsung ke Google Drive Dosen Pembimbing
 */
export async function uploadToDosenDrive(
  tokens: any,
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId?: string
): Promise<DriveUploadResult | null> {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  try {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const file = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: folderId ? [folderId] : undefined,
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: "id, name, webViewLink, size",
    });

    if (file.data.id) {
      try {
        await drive.permissions.create({
          fileId: file.data.id,
          requestBody: { role: "reader", type: "anyone" },
        });
      } catch (permErr) {
        // ignore
      }
    }

    return {
      fileId: file.data.id || "",
      name: file.data.name || fileName,
      webViewLink: file.data.webViewLink || `https://drive.google.com/file/d/${file.data.id}/view`,
      size: Number(file.data.size) || buffer.length,
    };
  } catch (err) {
    console.error("Gagal mengunggah file ke Google Drive dosen:", err);
    return null;
  }
}
