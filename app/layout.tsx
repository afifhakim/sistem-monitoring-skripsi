import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistem Pemantauan Skripsi - Dosen Pembimbing Afif Taufiiqul Hakim",
  description: "Sistem pelaporan progres bimbingan skripsi, monitoring per tahun, dan repositori berkas PDF, presentasi, serta simulasi terintegrasi Google Drive untuk Dosen Pembimbing Afif Taufiiqul Hakim",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased text-slate-800 bg-slate-50 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
