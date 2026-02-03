"use client";

import Link from "next/link";
import { SidebarTrigger } from "../ui/sidebar";

export const AdminNavbar = () => {
  return (
    <nav className="w-[100%] flex border-b bg-white shadow-md fixed top-0 z-50">
      <div className="mt-1 p-2">
        <SidebarTrigger />
      </div>

      <div className=" w-[80%] flex items-center justify-between px-4 py-3">
        {/* Logo / Brand */}

        <Link
          href="/admin/dashboard"
          className="text-xl  font-semibold text-gray-800 hover:text-blue-600 transition-colors"
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
      </div>
    </nav>
  );
};
