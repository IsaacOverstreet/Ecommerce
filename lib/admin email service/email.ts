import { Resend } from "resend";
import { handleUiError } from "../errorHandlers/uiErrors";
import { logger } from "@/utils/logger";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail(email: string, otp: string) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: "Your Admin Login OTP",
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h2 style="color: #333;">Admin Login Verification</h2>
              <p style="font-size: 16px; color: #555;">Hello,</p>
              <p style="font-size: 16px; color: #555;">
                Your one-time password (OTP) for logging into the admin dashboard is:
              </p>
              <div style="background-color: #f4f4f4; padding: 14px 0; font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 6px; margin: 20px 0; border-radius: 6px;">
                ${otp}
              </div>
              <p style="font-size: 14px; color: #888;">This code will expire in 5 minutes.</p>
              <p style="font-size: 14px; color: #888;">
                If you did not request this login, please ignore this email.
              </p>
              <p style="font-size: 14px; color: #555; margin-top: 20px;">
                — The Sabaoth Tech Team
              </p>
            </div>
          `,
    });
  } catch (err) {
    logger.error("Failed to send OTP email:", err);
    handleUiError(err);
  }
}
