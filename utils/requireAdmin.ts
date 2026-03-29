import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions); // no req/res needed in App Router

  if (!session) {
    // Return a response immediately if session is invalid
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return session;
}
