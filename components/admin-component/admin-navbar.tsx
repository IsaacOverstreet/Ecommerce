"use client";

import Link from "next/link";

export const AdminNavbar = () => {
  return (
    <nav className="w-full border-b bg-white shadow-md fixed top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo / Brand */}
        <Link
          href="/admin/dashboard"
          className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors"
        >
          The Creation Temple
        </Link>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex space-x-6 text-sm text-gray-700">
          <Link href="/admin/dashboard" className="hover:text-blue-500">
            Dashboard
          </Link>
          {/* Add more links here as needed */}
        </div>

        {/* Right-side Controls (Optional) */}
        <div className="space-x-2 sm:space-x-6">
          {/* Example: <Button>Profile</Button> or user menu */}
        </div>
      </div>
    </nav>
  );
};
