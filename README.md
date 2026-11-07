# Sistem Pemantauan Skripsi • Dosen Pembimbing Afif Taufiiqul Hakim

Sistem manajemen pelaporan progres mahasiswa bimbingan skripsi berbasis web modern dengan dukungan multi-dosen (dosen lain dapat mendaftar mandiri), otorisasi Google Drive pribadi per dosen (OAuth 2.0), monitoring pendaftar per tahun akademik, logbook berkala, serta repositori berkas PDF, slide presentasi, dan file raw simulasi.

---

## 🌟 Fitur Utama

1. **Akun Bersih & Multi-Dosen:**
   * **Akun Utama Pak Afif Taufiiqul Hakim:** Akun baru bersih (0 data dummy) siap untuk mahasiswa bimbingan riil Anda.
   * **Pendaftaran Dosen Lain:** Dosen pembimbing lain dapat mendaftar akun sendiri melalui halaman pendaftaran (`/register`). Setiap dosen memiliki dashboard terpisah dan hanya melihat mahasiswa bimbingannya masing-masing.

2. **Otorisasi Google Drive Pribadi per Dosen (OAuth 2.0 & Manual):**
   * Setiap dosen dapat menghubungkan akun Google Drive pribadi mereka dengan tombol **"Otorisasi Akun Google Drive Saya"**.
   * Berkas yang diunggah mahasiswa bimbingan akan otomatis terkirim ke Google Drive dosen pembimbing yang bersangkutan.
   * Mendukung input tautan Google Drive manual sebagai alternatif cepat.

3. **Dashboard Monitoring Pendaftar per Tahun:**
   * Rekapitulasi visual jumlah mahasiswa yang mendaftar pada Anda per tahun akademik (2023, 2024, 2025, 2026, dst.).
   * Filter tahapan: Proposal, Penelitian, Seminar Hasil, Sidang Akhir, Lulus.
   * Fitur review dan penilaian catatan logbook progres mingguan.

4. **Pusat Berkas 3 Kategori:**
   * Dokumen Naskah / Proposal (`.pdf`)
   * Slide Materi Presentasi (`.pptx` / `.pdf`)
   * File Raw Simulasi & Data Perhitungan (`.zip`, `.ipynb`, MATLAB, ANSYS, `.xlsx`)

---

## 🔑 Informasi Akun Tersedia

| Akun | Email | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Akun Resmi Pak Afif** | `afif@kampus.ac.id` | `afif123` | **Akun baru bersih (0 isian)** siap untuk mahasiswa bimbingan Anda |
| **Akun Demo Dosen** | `demo.dosen@kampus.ac.id` | `demo123` | Contoh tampilan dosen yang sudah terisi beberapa data mahasiswa |
| **Akun Demo Mahasiswa** | `mhs@kampus.ac.id` | `mhs123` | Contoh akun mahasiswa (Ahmad Fauzi) |

*(Di halaman Login juga tersedia tombol satu-klik untuk langsung masuk ke akun Pak Afif).*

---

## 🚀 Cara Menjalankan Secara Lokal

```powershell
cd "C:\Users\avfha\.gemini\antigravity\scratch\skripsi-management-system"
npm run dev
```
Buka browser di: **`http://localhost:3000`**

---

## 🔐 Panduan Otorisasi Google Drive (OAuth 2.0)

Untuk mengaktifkan tombol otorisasi Google Drive otomatis bagi setiap dosen:
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat project baru dan aktifkan **Google Drive API**.
3. Buka **APIs & Services > Credentials > Create Credentials > OAuth client ID**.
4. Pilih tipe **Web application**.
5. Tambahkan Authorized Redirect URIs:
   - Lokal: `http://localhost:3000/api/auth/google/callback`
   - Online (Vercel): `https://nama-aplikasi-anda.vercel.app/api/auth/google/callback`
6. Salin Client ID dan Client Secret ke berkas `.env`:
   ```env
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxx
   ```
7. Sekarang, setiap dosen dapat mengklik tombol hijau **"Otorisasi Akun Google Drive Saya"** di dashboard untuk menghubungkan Drive pribadi masing-masing!
*(Sebagai alternatif cepat tanpa setting Google Cloud, dosen juga bisa langsung memasukkan link folder Google Drive manual).*

---

## 🐙 Menyinkronkan ke GitHub

```powershell
cd "C:\Users\avfha\.gemini\antigravity\scratch\skripsi-management-system"
git add .
git commit -m "feat: Akun bersih Pak Afif, pendaftaran multi-dosen, dan otorisasi Google Drive per dosen"
git push
```
