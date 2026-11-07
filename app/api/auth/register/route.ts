import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { readDatabase, writeDatabase, User } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role = "MAHASISWA" } = body;

    const db = readDatabase();

    // 1. Registrasi Dosen Pembimbing Baru
    if (role === "DOSEN") {
      const { name, email, password, department, nip } = body;
      if (!name || !email || !password) {
        return NextResponse.json({ error: "Nama, email, dan kata sandi dosen wajib diisi." }, { status: 400 });
      }

      const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 400 });
      }

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);

      const newDosen: User = {
        id: `usr-dosen-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: "DOSEN",
        nip: nip || "",
        department: department || "Program Studi",
        driveAuth: { connected: false },
        createdAt: new Date().toISOString(),
      };

      db.users.push(newDosen);
      writeDatabase(db);

      const token = signToken(newDosen);
      const response = NextResponse.json({
        message: "Pendaftaran dosen pembimbing berhasil",
        user: { id: newDosen.id, name: newDosen.name, email: newDosen.email, role: newDosen.role },
      });

      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // 2. Registrasi Mahasiswa Bimbingan Baru
    const { name, email, password, nim, academicYear, thesisTitle, topic, dosenId } = body;

    if (!name || !email || !password || !nim || !academicYear || !thesisTitle) {
      return NextResponse.json(
        { error: "Nama, email, password, NIM, angkatan, dan judul skripsi wajib diisi." },
        { status: 400 }
      );
    }

    const existing = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() || (u.nim && u.nim === nim)
    );

    if (existing) {
      return NextResponse.json({ error: "Email atau NIM sudah terdaftar." }, { status: 400 });
    }

    // Cari nama dosen pembimbing yang dipilih
    let selectedDosen = db.users.find((u) => u.id === dosenId && u.role === "DOSEN");
    if (!selectedDosen) {
      // Default ke Afif Taufiiqul Hakim jika tidak memilih
      selectedDosen = db.users.find((u) => u.id === "usr-afif-hakim") || db.users.find((u) => u.role === "DOSEN");
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: User = {
      id: `usr-mhs-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "MAHASISWA",
      nim,
      academicYear,
      thesisTitle,
      topic: topic || "Penelitian Skripsi",
      status: "PROPOSAL",
      dosenId: selectedDosen?.id || "usr-afif-hakim",
      dosenName: selectedDosen?.name || "Afif Taufiiqul Hakim",
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeDatabase(db);

    const token = signToken(newUser);
    const response = NextResponse.json({
      message: "Pendaftaran berhasil",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        nim: newUser.nim,
        academicYear: newUser.academicYear,
        dosenName: newUser.dosenName,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Gagal memproses pendaftaran." }, { status: 500 });
  }
}
