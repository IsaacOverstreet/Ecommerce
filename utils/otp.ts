import crypto from "crypto";

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function getOTPExpiry(): Date {
  return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
}
