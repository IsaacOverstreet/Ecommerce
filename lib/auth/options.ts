import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { credentialsProviderAdmin } from "./providers/credentialsAdmin";
import { customerMagicLink } from "./providers/emailMagicLink";
import { customerGoogleProvider } from "./providers/google";
import { AuthOptions } from "next-auth";
import authCallbacks from "./callbacks";

import type { User } from "next-auth";

const prisma = new PrismaClient();
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days for customers
    updateAge: 24 * 60 * 60, // 24 hours refresh
  },
  providers: [
    customerMagicLink,
    customerGoogleProvider,
    credentialsProviderAdmin,
  ],
  callbacks: authCallbacks,

  pages: {
    signIn: "/auth/login", // Customer login
    signOut: "/auth/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-email",
    newUser: "/onboarding", // Customer onboarding
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  events: {
    async signIn({ user }: { user: User }) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });
      } catch (error) {
        console.error("Failed to update last login:", error);
        // Optional: continue silently
      }
    },
  },
};
