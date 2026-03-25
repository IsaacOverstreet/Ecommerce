"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock } from "lucide-react";
import axios from "axios";
import { appError } from "@/lib/errorHandlers/appError";
import { handleUiError } from "@/lib/errorHandlers/uiErrors";
import { logger } from "@/utils/logger";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, send OTP
      const res = await axios.post(
        "/api/admin/auth/send-otp",
        { email, password }, // this is the body
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.data) {
        throw appError(400, "Failed to send OTP");
      }

      // Store email in session storage for verification page
      sessionStorage.setItem("loginEmail", email);

      // Redirect to OTP verification
      router.push("/admin/Login/verify");
    } catch (err) {
      const res = handleUiError(err);
      setError(res);
      logger.error(err);
    } finally {
      setLoading(false);
    }
  };

  // const res = await signIn("credentials", {
  //   email,
  //   password,
  //   redirect: false,
  // });

  // setLoading(false);

  // if (res?.ok) {
  //   router.push("/admin/dashboard");
  // } else {
  //   alert("Invalid login credentials");
  // }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* LEFT SIDE */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold">
            <span className="text-green-500">CREATION</span>
            <span className="text-pink-500 text-3xl ">TEMPLE</span>
          </h1>

          <p className="text-gray-500 text-lg">Tagline here</p>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="hidden md:block w-px bg-gray-300" />

      {/* RIGHT SIDE */}
      <div className="flex flex-1 items-center justify-center p-8">
        <form onSubmit={handleLogin} className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-3xl font-semibold text-gray-800">
              ADMIN PANEL
            </h2>
            <p className="text-gray-500">Control login</p>
          </div>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* EMAIL */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Admin id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-400 hover:bg-green-500 text-black font-semibold py-3 rounded-lg transition"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
