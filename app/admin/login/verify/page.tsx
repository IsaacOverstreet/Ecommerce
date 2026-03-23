// app/admin/login/verify/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import axios from "axios";
import { appError } from "@/lib/errorHandlers/appError";
import { handleUiError } from "@/lib/errorHandlers/uiErrors";

export default function VerifyOTP() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get email from session storage
    const storedEmail = sessionStorage.getItem("loginEmail");
    if (!storedEmail) {
      //   router.push("/admin/Login");
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Verify OTP
      const res = await axios.post(
        "/api/auth/verify-otp",
        { email, otp },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
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
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div>
            <input
              type="text"
              required
              maxLength={6}
              pattern="[0-9]{6}"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
              placeholder="000000"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/admin/Login")}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Back to login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
