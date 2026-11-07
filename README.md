# Sistem Pemantauan Skripsi • Dosen Pembimbing Afif Taufiiqul Hakim

Sistem manajemen pelaporan progres mahasiswa bimbingan skripsi berbasis web modern untuk Dosen Pembimbing **Afif Taufiiqul Hakim** dengan dashboard monitoring pendaftar per tahun akademik, logbook progres berkala, dan repositori berkas (PDF dokumen naskah, slide presentasi, serta raw file simulasi/komputasi) terintegrasi Google Drive.

---

## 🌟 Fitur Utama

1. **Dashboard Dosen Pembimbing (Monitoring per Tahun):**
   - **Statistik Pendaftar Tahunan:** Menampilkan jumlah mahasiswa bimbingan yang mendaftar pada Afif Taufiiqul Hakim setiap tahun akademik (misal: 2023/2024, 2024/2025, 2025/2026, 2026/2027, dst.).
   - **Grafik Distribusi & Filter:** Filter mahasiswa berdasarkan tahun angkatan dan status tahapan skripsi (Proposal, Penelitian, Seminar Hasil, Sidang, Lulus).
   - **Review Logbook Bimbingan:** Meninjau laporan progres mingguan mahasiswa, memberikan catatan/koreksi pembimbing, serta menandai status (*Disetujui* / *Perlu Revisi*).
   - **Akses Cepat Google Drive:** Tautan langsung ke folder Google Drive utama dosen dan folder khusus tiap mahasiswa.

2. **Portal Mahasiswa Bimbingan:**
   - **Logbook Progres Mingguan:** Pengisian capaian mingguan, rincian pekerjaan, kendala teknis/komputasi, dan target selanjutnya.
   - **Riwayat Feedback:** Membaca catatan dan arahan perbaikan langsung dari dosen pembimbing.
   - **Pusat Unggah Berkas Penelitian (3 Kategori Khusus):**
     1. **Dokumen Naskah / Proposal (.pdf):** Draft skripsi, laporan kemajuan, artikel jurnal.
     2. **Slide Materi Presentasi (.pptx / .pdf):** Slide seminar proposal, seminar hasil, dan sidang akhir.
     3. **File Raw Simulasi / Data Perhitungan (.zip, scripts, dataset):** File mentah simulasi (ANSYS, MATLAB, Jupyter Notebook `.ipynb`, Excel validasi perhitungan, CAD, kode Python).

3. **Penyimpanan Berkas Terintegrasi Google Drive:**
   - Mendukung input **Tautan Berbagi Google Drive** (sangat ideal untuk file simulasi / dataset berukuran besar ratusan MB hingga gigabyte).
   - Mendukung **Upload Otomatis via Google Drive API** (mengelompokkan folder secara rapi: `[Tahun Akademik] / [NIM - Nama] / [Kategori]`).
   - Penyimpanan lokal otomatis (*fallback*) jika Google Drive API belum diaktifkan.

4. **Autentikasi Multi-Role Terpisah:**
   - Login terpisah untuk Dosen Pembimbing dan Mahasiswa.
   - Halaman registrasi mandiri untuk mahasiswa bimbingan baru.

---

## 🔑 Akun Demo Siap Pakai

Sistem sudah dilengkapi data awal (*seeded data*) untuk langsung diuji coba:

| Role | Email | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Dosen Pembimbing** | `afif@kampus.ac.id` *(atau `dosen@kampus.ac.id`)* | `dosen123` | Afif Taufiiqul Hakim (Akses dashboard analitik & review) |
| **Mahasiswa 1 (2025/2026)** | `mhs@kampus.ac.id` | `mhs123` | Ahmad Fauzi (NIM: 220401005) - Simulasi FEM |
| **Mahasiswa 2 (2024/2025)** | `fajar@kampus.ac.id` | `mhs123` | Fajar Pratama (NIM: 210401021) - Termal Baterai |
| **Mahasiswa 3 (2023/2024)** | `budi@kampus.ac.id` | `mhs123` | Budi Santoso (NIM: 200401010) - Lulus |

*(Pada halaman Login juga tersedia tombol klik-cepat akun demo).*

---

## 🚀 Cara Menjalankan Aplikasi Secara Lokal

### Prasyarat:
Pastikan Node.js (v18+) sudah terpasang di komputer Anda.

### Langkah-langkah:
1. Buka terminal di folder proyek ini:
   ```bash
   cd skripsi-management-system
   ```

2. Jalankan aplikasi dalam mode pengembangan:
   ```bash
   npm run dev
   ```

3. Buka browser dan akses:
   ```
   http://localhost:3000
   ```

---

## 📁 Panduan Menghubungkan Google Drive Anda

Ada dua cara mudah untuk memanfaatkan Google Drive Anda:

### Cara 1: Tautan Folder Google Drive (Paling Cepat & Praktis)
1. Buat folder di Google Drive Anda, misalnya: `Skripsi_Mahasiswa_Bimbingan`.
2. Klik kanan folder tersebut -> pilih **Bagikan (Share)** -> atur akses menjadi *"Siapa saja yang memiliki tautan sebagai Pelihat/Editor"*.
3. Salin tautan folder tersebut.
4. Masuk ke aplikasi sebagai Dosen -> klik tombol **Folder Google Drive** di kanan atas -> tempel tautan folder Anda -> klik **Simpan Tautan Drive**.
5. Mahasiswa dapat mengunggah file besar dengan menyalin link share Google Drive file/folder mereka langsung ke formulir unggah berkas.

### Cara 2: Sinkronisasi Otomatis Menggunakan Google Drive API (Opsional)
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat proyek baru dan aktifkan **Google Drive API**.
3. Buat **Service Account**, lalu unduh kunci (*Key*) dalam format JSON.
4. Buat file `.env` di folder proyek (salin dari `.env.example`):
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL=email-service-account@proyek-anda.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_DRIVE_FOLDER_ID=id_folder_drive_dosen_anda
   ```
5. Bagikan (*Share*) folder Google Drive Anda ke alamat email Service Account tersebut dengan hak akses **Editor**.

---

## 🐙 Cara Memasukkan / Push Proyek ke GitHub Anda

Ikuti langkah-langkah berikut untuk mengunggah proyek ini ke akun GitHub Anda:

1. **Buat Repository Baru di GitHub:**
   - Buka [GitHub](https://github.com/) dan login ke akun Anda.
   - Klik tombol **New** (Buat Repository Baru).
   - Beri nama repository (misal: `sistem-monitoring-skripsi`).
   - Pilih **Public** atau **Private**, lalu biarkan opsi *"Initialize this repository with a README"* **tidak dicentang**.
   - Klik **Create repository**.
   - Salin URL repository Anda, contoh: `https://github.com/username-anda/sistem-monitoring-skripsi.git`.

2. **Buka Terminal di Folder Proyek Ini:**
   ```powershell
   cd "C:\Users\avfha\.gemini\antigravity\scratch\skripsi-management-system"
   ```

3. **Inisialisasi Git & Tambahkan Remote:**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit: Sistem Pelaporan Progres Skripsi & Repositori Simulasi"
   git branch -M main
   git remote add origin https://github.com/username-anda/sistem-monitoring-skripsi.git
   ```

4. **Kirim (*Push*) Kode ke GitHub:**
   ```powershell
   git push -u origin main
   ```
   *(Jika diminta autentikasi, masukkan akun GitHub Anda atau Personal Access Token).*

---

## 🛠️ Struktur Direktori Proyek

```
skripsi-management-system/
├── app/
│   ├── api/
│   │   ├── auth/            # Login, register, me, logout
│   │   ├── dosen/           # Analisis tahunan, review logbook, data mahasiswa
│   │   ├── mahasiswa/       # Pengajuan logbook, upload berkas PDF/PPT/Simulasi
│   │   ├── drive/           # Pengaturan & status Google Drive
│   │   └── files/           # Penyaji berkas lokal
│   ├── dosen/               # Dashboard Dosen (statistik tahunan & review berkas)
│   ├── mahasiswa/           # Portal Mahasiswa (logbook & repositori berkas)
│   ├── login/               # Halaman masuk sistem terpisah
│   ├── register/            # Halaman pendaftaran mahasiswa baru
│   ├── layout.tsx           # Layout dasar & font
│   └── page.tsx             # Halaman utama (landing portal)
├── data/
│   └── db.json              # Basis data file-based (otomatis dibuat dan diisi)
├── lib/
│   ├── auth.ts              # Manajemen sesi JWT
│   ├── db.ts                # Model data & operasi CRUD
│   └── googleDrive.ts       # Integrasi Google Drive API
├── uploads/                 # Folder penyimpanan lokal (fallback)
├── .env.example             # Contoh variabel lingkungan
├── package.json             # Dependensi proyek
└── README.md                # Dokumentasi lengkap
```
