import { sendOTPEmail } from "@/lib/admin email service/email";
import { prisma } from "@/lib/prisma/client";
import { generateOTP, getOTPExpiry } from "@/utils/otp";
import { NextResponse } from "next/server";

// app/api/admin/resend-otp/route.ts
export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  //check the email exists, no password needed
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return NextResponse.json({ message: "Invalid request" }, { status: 401 });
  }

  //Generate OTP
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

  return NextResponse.json({ message: "OTP resent" });
}
