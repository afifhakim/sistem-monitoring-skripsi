import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      nim: user.nim,
      academicYear: user.academicYear,
      thesisTitle: user.thesisTitle,
      topic: user.topic,
      status: user.status,
      driveFolderUrl: user.driveFolderUrl,
    },
  });
}
