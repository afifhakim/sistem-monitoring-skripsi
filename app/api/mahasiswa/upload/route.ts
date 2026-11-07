import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readDatabase, writeDatabase, UploadedFile, FileCategory } from "@/lib/db";
import { isGoogleDriveConfigured, getOrCreateFolder, uploadToDrive } from "@/lib/googleDrive";
import fs from "fs";
import path from "path";

const uploadsDir = path.join(process.cwd(), "uploads");

function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "MAHASISWA") {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") || "";

  // 1. Tautan Langsung Google Drive (Shared Link)
  if (contentType.includes("application/json")) {
    try {
      const { category, fileName, driveUrl, notes, progressLogId } = await request.json();

      if (!driveUrl || !fileName || !category) {
        return NextResponse.json(
          { error: "Nama berkas, kategori, dan tautan Google Drive wajib diisi." },
          { status: 400 }
        );
      }

      const db = readDatabase();
      const newFile: UploadedFile = {
        id: `file-${Date.now()}`,
        studentId: user.id,
        studentName: user.name,
        nim: user.nim || "-",
        academicYear: user.academicYear || "Belum Ditentukan",
        progressLogId: progressLogId || undefined,
        category: category as FileCategory,
        fileName,
        fileUrl: driveUrl,
        driveWebViewLink: driveUrl,
        isDriveDirectLink: true,
        notes: notes || "",
        uploadedAt: new Date().toISOString(),
      };

      db.files.push(newFile);
      writeDatabase(db);

      return NextResponse.json({ message: "Tautan berkas Google Drive berhasil disimpan.", file: newFile });
    } catch (err: any) {
      return NextResponse.json({ error: "Gagal menyimpan tautan berkas." }, { status: 500 });
    }
  }

  // 2. Upload Berkas Fisik (Form Data)
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as FileCategory) || "DOKUMEN_PDF";
    const notes = (formData.get("notes") as string) || "";
    const progressLogId = (formData.get("progressLogId") as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: "Berkas tidak ditemukan." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let finalUrl = "";
    let driveFileId: string | undefined;
    let driveWebViewLink: string | undefined;

    // Cek apakah Google Drive API sudah dihubungkan
    if (isGoogleDriveConfigured()) {
      try {
        const rootFolder = process.env.GOOGLE_DRIVE_FOLDER_ID || undefined;
        // Buat folder berjenjang: [Tahun Akademik] / [NIM - Nama]
        const yearFolderId = await getOrCreateFolder(user.academicYear || "Tahun_Umum", rootFolder);
        const studentFolderName = `${user.nim || "MHS"}_${user.name.replace(/[^a-zA-Z0-9]/g, "_")}`;
        const studentFolderId = await getOrCreateFolder(studentFolderName, yearFolderId || undefined);

        const uploadResult = await uploadToDrive(
          buffer,
          file.name,
          file.type || "application/octet-stream",
          studentFolderId || undefined
        );

        if (uploadResult) {
          finalUrl = uploadResult.webViewLink;
          driveFileId = uploadResult.fileId;
          driveWebViewLink = uploadResult.webViewLink;
        }
      } catch (driveErr) {
        console.warn("Gagal upload via Google Drive API, menyimpan ke lokal storage:", driveErr);
      }
    }

    // Jika belum ada Drive API atau upload Drive gagal, simpan ke lokal storage
    if (!finalUrl) {
      ensureUploadsDir();
      const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const savePath = path.join(uploadsDir, safeName);
      fs.writeFileSync(savePath, buffer);
      finalUrl = `/api/files/${safeName}`;
    }

    const db = readDatabase();
    const newFile: UploadedFile = {
      id: `file-${Date.now()}`,
      studentId: user.id,
      studentName: user.name,
      nim: user.nim || "-",
      academicYear: user.academicYear || "Belum Ditentukan",
      progressLogId,
      category,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl: finalUrl,
      driveFileId,
      driveWebViewLink,
      isDriveDirectLink: false,
      notes,
      uploadedAt: new Date().toISOString(),
    };

    db.files.push(newFile);
    writeDatabase(db);

    return NextResponse.json({ message: "Berkas berhasil diunggah.", file: newFile });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Gagal memproses unggahan berkas." }, { status: 500 });
  }
}
