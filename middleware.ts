import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const publicAdminRoutes = ["/admin/Login", "/admin/Login/verify"];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    //  Don't block the login page
    if (publicAdminRoutes.includes(pathname)) {
      if (token) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.next();
    }

    // Block all other /admin routes if not admin
    if (!token || !token.isAdmin) {
      return NextResponse.redirect(new URL("/admin/Login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  },
);

export const config = {
  matcher: ["/admin/:path*"], // runs for all /admin routes only
};
