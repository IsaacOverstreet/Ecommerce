// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: "ADMIN" | "CUSTOMER";
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isVerified?: boolean;
    };
  }

  interface User {
    role?: "ADMIN" | "CUSTOMER";
    isVerified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    role?: "ADMIN" | "CUSTOMER";
    isVerified?: boolean;
  }
}
