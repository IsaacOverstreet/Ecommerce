// app/api/auth/verify-otp/route.ts
import { withErrorHandler } from "@/lib/errorHandlers/apiErrors";
import { appError } from "@/lib/errorHandlers/appError";
import { prisma } from "@/lib/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const { email, otp } = await req.json();

  if (!email || !otp) {
    throw appError(400, "Email and OTP required");
  }

  // Find admin
  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    throw appError(401, "Invalid request");
  }

  await prisma.$transaction(async (tx) => {
    // Mark OTP as used
    const result = await tx.adminOTP.updateMany({
      where: {
        adminId: admin.id,
        code: otp,
        expiresAt: { gt: new Date() },
        used: false,
      },
      data: {
        used: true,
      },
    });

    if (result.count === 0) {
      throw appError(401, "Invalid or expired OTP");
    }

    // Clean up old OTPs
    await tx.adminOTP.deleteMany({
      where: {
        adminId: admin.id,
        OR: [{ expiresAt: { lt: new Date() } }, { used: true }],
      },
    });
  });
  return NextResponse.json({
    message: "OTP verified successfully",
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    },
  });
});
