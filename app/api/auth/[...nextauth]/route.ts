import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { logger } from "@/lib/utils/logger";
import { NextResponse } from "next/server";

const handler = NextAuth(authOptions);

export async function GET(req: Request) {
  try {
    return await handler(req);
  } catch (error) {
    logger.error("Get Auth error", error);
    return NextResponse.json(
      { error: "Authentication failed (GET)" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    return await handler(req);
  } catch (error) {
    logger.error("Post Auth error", error);
    return NextResponse.json(
      { error: "Authentication failed (POST)" },
      { status: 500 }
    );
  }
}
