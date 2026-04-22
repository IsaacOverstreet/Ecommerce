// app/admin/login/verify/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import axios from "axios";
import { appError } from "@/lib/errorHandlers/appError";
import { handleUiError } from "@/lib/errorHandlers/uiErrors";
import { logger } from "@/utils/logger";

export default function VerifyOTP() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  useEffect(() => {
    // Get email from session storage
    const storedEmail = sessionStorage.getItem("loginEmail");
    if (!storedEmail) {
      router.push("/admin/Login");
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  //Resend Otp
  const handleResend = async () => {
    if (timeLeft > 0) return;

    try {
      // Resend Otp
      const res = await axios.post(
        "/api/admin/auth/resend-otp",
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.data) {
        throw appError(400, "Failed to resend OTP");
      }

      setTimeLeft(60); // reset timer
      setIsActive(true);
    } catch (err) {
      const res = handleUiError(err);
      setError(res);
      logger.error(err);
    }
  };

  //Confirm Otp
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Verify OTP
      const res = await axios.post(
        "/api/admin/auth/verify-otp",
        { email, otp },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.data) {
        throw appError(400, "Invalid OTP");
      }

      // Sign in with NextAuth
      const result = await signIn("credentials", {
        email,
        password: "verified", // Password is already verified, this is a placeholder
        redirect: false,
      });

      if (result?.error) {
        throw appError(400, "Failed to complete login");
      }

      // Clear session storage
      sessionStorage.removeItem("loginEmail");

      // Redirect to admin dashboard
      router.push("/admin/dashboard");
    } catch (err) {
      const res = handleUiError(err);
      setError(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify OTP
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit code sent to {email}
          </p>
        </div>
        <form
          className="mt-10 max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg space-y-6 border border-gray-100"
          onSubmit={handleSubmit}
        >
          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              Verify Your Account
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 border border-red-200">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* OTP Input */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                required
                maxLength={6}
                pattern="[0-9]{6}"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center text-3xl tracking-[0.5em] font-semibold py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                placeholder="••••••"
              />

              {/* Timer */}
              <div className="text-sm font-medium text-gray-500 min-w-[50px] text-right">
                {timeLeft}s
              </div>
            </div>

            {/* Resend */}
            <button
              type="button"
              disabled={isActive}
              onClick={handleResend}
              className={`text-sm font-medium transition ${
                isActive
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-indigo-600 hover:text-indigo-800"
              }`}
            >
              Resend OTP
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>

          {/* Back */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/admin/Login")}
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              ← Back to login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
