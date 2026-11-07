import { NextResponse } from "next/server";
import { readDatabase } from "@/lib/db";

export async function GET() {
  const db = readDatabase();
  const dosens = db.users
    .filter((u) => u.role === "DOSEN")
    .map((d) => ({
      id: d.id,
      name: d.name,
      department: d.department || "Program Studi",
      hasDrive: Boolean(d.driveAuth?.connected || d.driveAuth?.mainFolderUrl),
    }));

  return NextResponse.json({ dosens });
}
