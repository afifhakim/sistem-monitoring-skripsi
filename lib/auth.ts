import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { User, readDatabase } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "skripsi-secure-jwt-key-2026-development-super-secret";

export interface SessionPayload {
  id: string;
  email: string;
  name: string;
  role: "DOSEN" | "MAHASISWA";
  nim?: string;
  academicYear?: string;
}

export function signToken(user: User): string {
  const payload: SessionPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    nim: user.nim,
    academicYear: user.academicYear,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const db = readDatabase();
    const user = db.users.find((u) => u.id === payload.id);
    return user || null;
  } catch (error) {
    return null;
  }
}
