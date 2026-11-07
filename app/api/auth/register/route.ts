import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { readDatabase, writeDatabase, User } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, nim, academicYear, thesisTitle, topic } = body;

    if (!name || !email || !password || !nim || !academicYear || !thesisTitle) {
      return NextResponse.json(
        { error: "Semua kolom wajib diisi (Nama, Email, Password, NIM, Angkatan, dan Judul Skripsi)." },
        { status: 400 }
      );
    }

    const db = readDatabase();
    const existing = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() || (u.nim && u.nim === nim)
    );

    if (existing) {
      return NextResponse.json(
        { error: "Email atau NIM sudah terdaftar dalam sistem." },
        { status: 400 }
      );
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
