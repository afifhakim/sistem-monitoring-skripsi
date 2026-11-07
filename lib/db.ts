import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

export type Role = "DOSEN" | "MAHASISWA";
export type StudentStatus = "PROPOSAL" | "PENELITIAN" | "SEMINAR_HASIL" | "SIDANG" | "LULUS";
export type LogStatus = "MENUNGGU_REVIEW" | "DISETUJUI" | "PERLU_REVISI";
export type FileCategory = "DOKUMEN_PDF" | "PRESENTASI" | "SIMULASI_RAW";

export interface DosenDriveAuth {
  connected: boolean;
  googleEmail?: string;
  accessToken?: string;
  refreshToken?: string;
  expiryDate?: number;
  mainFolderId?: string;
  mainFolderUrl?: string;
  connectedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  nip?: string;
  department?: string;
  driveAuth?: DosenDriveAuth;
  // Khusus Mahasiswa:
  nim?: string;
  academicYear?: string;
  thesisTitle?: string;
  topic?: string;
  status?: StudentStatus;
  dosenId?: string;
  dosenName?: string;
  driveFolderUrl?: string;
  createdAt: string;
}

export interface ProgressLog {
  id: string;
  studentId: string;
  dosenId: string;
  studentName: string;
  nim: string;
  academicYear: string;
  weekNumber: number;
  date: string;
  title: string;
  summary: string;
  blockers: string;
  nextPlan: string;
  status: LogStatus;
  dosenNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface UploadedFile {
  id: string;
  studentId: string;
  dosenId: string;
  studentName: string;
  nim: string;
  academicYear: string;
  progressLogId?: string;
  category: FileCategory;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  fileUrl: string;
  driveFileId?: string;
  driveWebViewLink?: string;
  isDriveDirectLink: boolean;
  notes?: string;
  uploadedAt: string;
}

export interface DatabaseSchema {
  users: User[];
  progressLogs: ProgressLog[];
  files: UploadedFile[];
}

const dataDir = path.join(process.cwd(), "data");
const dbFilePath = path.join(dataDir, "db.json");

function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getInitialData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const passwordAfif = bcrypt.hashSync("afif123", salt);
  const passwordDemoDosen = bcrypt.hashSync("demo123", salt);
  const passwordMhs = bcrypt.hashSync("mhs123", salt);

  const users: User[] = [
    // 1. Akun Resmi Bersih Pak Afif Taufiiqul Hakim (Fresh - Belum ada isian mahasiswa)
    {
      id: "usr-afif-hakim",
      name: "Afif Taufiiqul Hakim",
      email: "afif@kampus.ac.id",
      passwordHash: passwordAfif,
      role: "DOSEN",
      department: "Teknik",
      driveAuth: {
        connected: false,
        mainFolderUrl: "",
      },
      createdAt: new Date().toISOString(),
    },

    // 2. Akun Demo Dosen (Dilengkapi contoh data untuk referensi tampilan)
    {
      id: "usr-demo-dosen",
      name: "Dr. Ir. Demo Pembimbing, M.T.",
      email: "demo.dosen@kampus.ac.id",
      passwordHash: passwordDemoDosen,
      role: "DOSEN",
      department: "Teknik Mesin",
      driveAuth: {
        connected: false,
        mainFolderUrl: "https://drive.google.com/drive/folders/demo-drive-folder",
      },
      createdAt: new Date("2023-01-01").toISOString(),
    },

    // Mahasiswa Bimbingan Terhubung ke Akun Demo (Bisa dipelajari sebagai referensi)
    {
      id: "usr-mhs-1",
      name: "Budi Santoso",
      email: "budi@kampus.ac.id",
      passwordHash: passwordMhs,
      role: "MAHASISWA",
      nim: "200401010",
      academicYear: "2023/2024",
      thesisTitle: "Analisis Dinamika Fluida Turbin Air Piko-Hidro Menggunakan Simulasi CFD",
      topic: "Konversi Energi & Simulasi Fluida",
      status: "LULUS",
      dosenId: "usr-demo-dosen",
      dosenName: "Dr. Ir. Demo Pembimbing, M.T.",
      driveFolderUrl: "https://drive.google.com/drive/folders/sample-budi-2023",
      createdAt: new Date("2023-09-01").toISOString(),
    },
    {
      id: "usr-mhs-2",
      name: "Rina Wijaya",
      email: "rina@kampus.ac.id",
      passwordHash: passwordMhs,
      role: "MAHASISWA",
      nim: "200401015",
      academicYear: "2023/2024",
      thesisTitle: "Optimasi Topologi Sayap Pesawat Tanpa Awak Berbasis Komposit Karbon",
      topic: "Material & Komputasi Struktur",
      status: "LULUS",
      dosenId: "usr-demo-dosen",
      dosenName: "Dr. Ir. Demo Pembimbing, M.T.",
      driveFolderUrl: "https://drive.google.com/drive/folders/sample-rina-2023",
      createdAt: new Date("2023-09-05").toISOString(),
    },
    {
      id: "usr-mhs-3",
      name: "Fajar Pratama",
      email: "fajar@kampus.ac.id",
      passwordHash: passwordMhs,
      role: "MAHASISWA",
      nim: "210401021",
      academicYear: "2024/2025",
      thesisTitle: "Simulasi Perpindahan Panas Sistem Pendingin Baterai Lithium-ion Kendaraan Listrik",
      topic: "Sistem Termal & Simulasi Numerik",
      status: "SEMINAR_HASIL",
      dosenId: "usr-demo-dosen",
      dosenName: "Dr. Ir. Demo Pembimbing, M.T.",
      driveFolderUrl: "https://drive.google.com/drive/folders/sample-fajar-2024",
      createdAt: new Date("2024-09-02").toISOString(),
    },
    {
      id: "usr-mhs-4",
      name: "Ahmad Fauzi",
      email: "mhs@kampus.ac.id",
      passwordHash: passwordMhs,
      role: "MAHASISWA",
      nim: "220401005",
      academicYear: "2025/2026",
      thesisTitle: "Simulasi Elemen Hingga (FEM) Sambungan Las Tabung Bertekanan Tinggi",
      topic: "Mekanika Terapan & FEM",
      status: "PENELITIAN",
      dosenId: "usr-demo-dosen",
      dosenName: "Dr. Ir. Demo Pembimbing, M.T.",
      driveFolderUrl: "https://drive.google.com/drive/folders/sample-ahmad-2025",
      createdAt: new Date("2025-09-01").toISOString(),
    },
  ];

  const progressLogs: ProgressLog[] = [
    {
      id: "log-1",
      studentId: "usr-mhs-4",
      dosenId: "usr-demo-dosen",
      studentName: "Ahmad Fauzi",
      nim: "220401005",
      academicYear: "2025/2026",
      weekNumber: 4,
      date: "2026-10-15",
      title: "Penyelesaian Model Mesh 3D & Uji Konvergensi Mesh",
      summary: "Telah menyelesaikan meshing tetrahedral pada sambungan las dengan variasi ukuran elemen 1mm, 0.5mm, dan 0.25mm. Grafik konvergensi tegangan von Mises sudah stabil pada elemen 0.5mm.",
      blockers: "Membutuhkan waktu komputasi cukup lama saat running variasi beban siklik.",
      nextPlan: "Menjalankan variasi beban statik batas elastis dan memvalidasi hasil simulasi dengan teori tegangan geser.",
      status: "DISETUJUI",
      dosenNotes: "Bagus, mesh konvergensi sudah tepat. Lanjutkan ke pembebanan siklik dan pastikan boundary conditions di kedua ujung tabung dimodelkan sesuai standar ASME.",
      reviewedAt: "2026-10-17T10:00:00Z",
      createdAt: "2026-10-15T08:30:00Z",
    },
    {
      id: "log-2",
      studentId: "usr-mhs-4",
      dosenId: "usr-demo-dosen",
      studentName: "Ahmad Fauzi",
      nim: "220401005",
      academicYear: "2025/2026",
      weekNumber: 5,
      date: "2026-10-29",
      title: "Simulasi Analisis Tegangan Batas & Pembuatan Draft Bab 4",
      summary: "Memasukkan material nonlinear bilinear kinematic hardening. Data perhitungan raw hasil ANSYS APDL telah diekstrak ke Excel dan script plotting Python.",
      blockers: "Perlu pengecekan apakah kriteria keruntuhan Mohr-Coulomb atau von Mises yang lebih representatif.",
      nextPlan: "Menyelesaikan grafik kontur tegangan dan menyusun laporan Bab 4 untuk seminar hasil.",
      status: "MENUNGGU_REVIEW",
      createdAt: "2026-10-29T14:15:00Z",
    },
  ];

  const files: UploadedFile[] = [
    {
      id: "file-1",
      studentId: "usr-mhs-4",
      dosenId: "usr-demo-dosen",
      studentName: "Ahmad Fauzi",
      nim: "220401005",
      academicYear: "2025/2026",
      progressLogId: "log-2",
      category: "DOKUMEN_PDF",
      fileName: "Draft_Skripsi_Bab_1_sampai_3_Revisi_AhmadFauzi.pdf",
      fileSize: 3450000,
      fileType: "application/pdf",
      fileUrl: "https://drive.google.com/file/d/sample-pdf-ahmad/view",
      driveWebViewLink: "https://drive.google.com/file/d/sample-pdf-ahmad/view",
      isDriveDirectLink: true,
      notes: "Naskah proposal revisi sesuai masukan bimbingan minggu ke-3",
      uploadedAt: "2026-10-29T14:20:00Z",
    },
    {
      id: "file-2",
      studentId: "usr-mhs-4",
      dosenId: "usr-demo-dosen",
      studentName: "Ahmad Fauzi",
      nim: "220401005",
      academicYear: "2025/2026",
      progressLogId: "log-2",
      category: "PRESENTASI",
      fileName: "Slide_Kemajuan_Penelitian_Simulasi_Las.pptx",
      fileSize: 8200000,
      fileType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      fileUrl: "https://drive.google.com/file/d/sample-ppt-ahmad/view",
      driveWebViewLink: "https://drive.google.com/file/d/sample-ppt-ahmad/view",
      isDriveDirectLink: true,
      notes: "Slide presentasi progress bimbingan minggu ke-5",
      uploadedAt: "2026-10-29T14:25:00Z",
    },
    {
      id: "file-3",
      studentId: "usr-mhs-4",
      dosenId: "usr-demo-dosen",
      studentName: "Ahmad Fauzi",
      nim: "220401005",
      academicYear: "2025/2026",
      progressLogId: "log-2",
      category: "SIMULASI_RAW",
      fileName: "Raw_Simulation_ANSYS_APDL_Dataset.zip",
      fileSize: 185000000,
      fileType: "application/zip",
      fileUrl: "https://drive.google.com/drive/folders/sample-drive-raw-simulation-ahmad",
      driveWebViewLink: "https://drive.google.com/drive/folders/sample-drive-raw-simulation-ahmad",
      isDriveDirectLink: true,
      notes: "File mentah simulasi: script .mac (APDL macro), database .dbd ANSYS, dan sheet perhitungan Excel validasi",
      uploadedAt: "2026-10-29T14:28:00Z",
    },
  ];

  return { users, progressLogs, files };
}

export function readDatabase(): DatabaseSchema {
  ensureDirectoryExists(dataDir);
  if (!fs.existsSync(dbFilePath)) {
    const initialData = getInitialData();
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }

  try {
    const raw = fs.readFileSync(dbFilePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading db.json, returning fresh state", err);
    return getInitialData();
  }
}

export function writeDatabase(data: DatabaseSchema): void {
  ensureDirectoryExists(dataDir);
  const tempPath = `${dbFilePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempPath, dbFilePath);
}
