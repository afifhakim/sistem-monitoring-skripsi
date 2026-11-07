import { google } from "googleapis";
import { Readable } from "stream";

export interface DriveUploadResult {
  fileId: string;
  name: string;
  webViewLink: string;
  size?: number;
}

export function isGoogleDriveConfigured(): boolean {
  return Boolean(
    (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
}

function getDriveClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (privateKey) {
    // Replace escaped newlines if passed in .env
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (email && privateKey) {
    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    return google.drive({ version: "v3", auth });
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const auth = new google.auth.GoogleAuth({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    return google.drive({ version: "v3", auth });
  }

  return null;
}

/**
 * Finds or creates a folder with a given name inside a parent folder
 */
export async function getOrCreateFolder(folderName: string, parentId?: string): Promise<string | null> {
  const drive = getDriveClient();
  if (!drive) return null;

  try {
    let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }

    const response = await drive.files.list({
      q: query,
      fields: "files(id, name)",
      spaces: "drive",
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id!;
    }

    // Create folder
    const fileMetadata: any = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    };
    if (parentId) {
      fileMetadata.parents = [parentId];
    }

    const folder = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id, name",
    });

    return folder.data.id || null;
  } catch (error) {
    console.error("Error creating/getting Google Drive folder:", error);
    return null;
  }
}

/**
 * Uploads a file buffer directly to Google Drive
 */
export async function uploadToDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId?: string
): Promise<DriveUploadResult | null> {
  const drive = getDriveClient();
  if (!drive) return null;

  try {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const fileMetadata: any = {
      name: fileName,
    };
    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const media = {
      mimeType,
      body: stream,
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, webViewLink, size",
    });

    // Make file readable by anyone with the link (so dosen and student can preview)
    if (file.data.id) {
      try {
        await drive.permissions.create({
          fileId: file.data.id,
          requestBody: {
            role: "reader",
            type: "anyone",
          },
        });
      } catch (permErr) {
        console.warn("Could not set anyone reader permission, file remains accessible to drive account:", permErr);
      }
    }

    return {
      fileId: file.data.id || "",
      name: file.data.name || fileName,
      webViewLink: file.data.webViewLink || `https://drive.google.com/file/d/${file.data.id}/view`,
      size: Number(file.data.size) || buffer.length,
    };
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);
    return null;
  }
}
