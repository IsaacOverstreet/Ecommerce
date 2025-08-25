import { withAuth } from "next-auth/middleware";

import { isAdmin, isCustomer } from "./lib/middleware/role";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const pathname = req.nextUrl.pathname;
      // Public routes
      if (pathname.startsWith("/auth")) return true;
      //  Admin route
      if (pathname.startsWith("/admin")) {
        return isAdmin(token);
      }

      // Customer routes
      return isCustomer(token);
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
});

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/cart/:path*"],
};
