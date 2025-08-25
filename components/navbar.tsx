"use client";

import Link from "next/link";

export const Navbar = () => {
  return (
    <nav className="sticky w-[100%] bg-white top-0 z-50  shadow  ">
      <div className="w-[98%] border border-solid mx-auto flex items-center justify-between px-2  py-2">
        <Link href="/" className="hover:text-blue-600">
          The creation temple
        </Link>
        <div className="hidden md:flex space-x-6">
          <Link href="/">Home</Link>
          <Link href="/products" className="hover:text-blue-600">
            Products
          </Link>
          <Link href="/checkout" className="hover:text-blue-600">
            Checkout
          </Link>
        </div>
        <div className="space-x-2 sm:space-x-6 ">
          <Link href="/cart">Cart</Link>
          <Link href="/auth/login">Login</Link>
          <Link href="/admin" className="hidden sm:inline">
            Admin
          </Link>
        </div>
        {/* <div className="flex items-center space-x-4"></div> */}
      </div>
    </nav>
  );
};
