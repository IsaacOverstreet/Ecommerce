import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Prevent logged-in admins from seeing login page
    if (pathname === "/admin/login" && token) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // Only allow admins
    if (!token || !token.isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"], // runs for all /admin routes only
};
