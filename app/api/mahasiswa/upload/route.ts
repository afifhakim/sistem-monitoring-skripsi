import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readDatabase, writeDatabase, UploadedFile, FileCategory } from "@/lib/db";
import { getOrCreateSubfolder, uploadToDosenDrive } from "@/lib/googleDrive";
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

  const db = readDatabase();
  const student = user;
  const dosenId = student.dosenId || "usr-afif-hakim";
  const dosen = db.users.find((u) => u.id === dosenId);

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

      const newFile: UploadedFile = {
        id: `file-${Date.now()}`,
        studentId: student.id,
        dosenId,
        studentName: student.name,
        nim: student.nim || "-",
        academicYear: student.academicYear || "Belum Ditentukan",
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

    // Cek apakah Dosen Pembimbing mahasiswa ini sudah mengizinkan koneksi Google Drive OAuth
    if (dosen && dosen.driveAuth?.connected && dosen.driveAuth?.refreshToken) {
      try {
        const tokens = {
          access_token: dosen.driveAuth.accessToken,
          refresh_token: dosen.driveAuth.refreshToken,
        };

        const rootFolderId = dosen.driveAuth.mainFolderId || undefined;
        const yearFolderId = await getOrCreateSubfolder(tokens, student.academicYear || "Tahun_Umum", rootFolderId);
        const studentFolderName = `${student.nim || "MHS"}_${student.name.replace(/[^a-zA-Z0-9]/g, "_")}`;
        const studentFolderId = await getOrCreateSubfolder(tokens, studentFolderName, yearFolderId || undefined);

        const uploadResult = await uploadToDosenDrive(
          tokens,
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
        console.warn("Gagal upload via Google Drive Dosen, menyimpan ke fallback lokal:", driveErr);
      }
    }

    // Jika belum terhubung Google Drive atau gagal, simpan ke lokal storage
    if (!finalUrl) {
      ensureUploadsDir();
      const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const savePath = path.join(uploadsDir, safeName);
      fs.writeFileSync(savePath, buffer);
      finalUrl = `/api/files/${safeName}`;
    }

    const newFile: UploadedFile = {
      id: `file-${Date.now()}`,
      studentId: student.id,
      dosenId,
      studentName: student.name,
      nim: student.nim || "-",
      academicYear: student.academicYear || "Belum Ditentukan",
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
