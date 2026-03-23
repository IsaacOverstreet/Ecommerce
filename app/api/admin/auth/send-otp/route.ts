import { sendOTPEmail } from "@/lib/admin email service/email";
import { withErrorHandler } from "@/lib/errorHandlers/apiErrors";
import { prisma } from "@/lib/prisma/client";
import { generateOTP, getOTPExpiry } from "@/utils/otp";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 }
    );
  }

  // Find admin
  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Verify password
  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Generate OTP
  const otp = generateOTP();
  const expiresAt = getOTPExpiry();

  await prisma.$transaction(async (tx) => {
    // Delete any existing OTPs for this admin
    await tx.adminOTP.deleteMany({
      where: { adminId: admin.id },
    });

    // Save new OTP
    await tx.adminOTP.create({
      data: {
        code: otp,
        adminId: admin.id,
        expiresAt,
      },
    });

    // Send OTP via email
  });
  await sendOTPEmail(email, otp);

  return NextResponse.json({
    message: "OTP sent successfully",
    email: email,
  });
});
