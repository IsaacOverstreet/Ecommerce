import type { User, Account } from "next-auth";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";
import { Session } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { logger } from "../../utils/logger";
import { handleCustomerLogin } from "./actions/customer";

const prisma = new PrismaClient();

const authCallbacks = {
  /////////SIGNIN/////////////////////////
  async signIn({
    user,
    account,
  }: {
    user: User | AdapterUser;
    account?: Account | null;
  }): Promise<boolean> {
    try {
      // Block inactive/deleted users
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });
      if (!dbUser?.active || dbUser.deletedAt) {
        logger.warn("Blocked inactive/deleted user", { email: user.email });
        return false;
      }

      // For OAuth users, ensure email is verified
      if (account?.provider !== "credentials") {
        if (!dbUser.emailVerified) {
          logger.warn("Email not verified", { email: user.email });
          return false;
        }
      }
      return true;
    } catch (error) {
      logger.error("Signin callback failed", { error: error });
      return false;
    }
  },

  /////////JWT////////////////////////////
  async jwt({
    token,
    user,
    account,
  }: {
    token: JWT;
    user?: User | AdapterUser;
    account: Account | null;
  }): Promise<JWT> {
    // Persist role and verification status to JWT
    if (user) {
      token.role = user.role;

      if (account?.provider !== "credentials") {
        await handleCustomerLogin(user);
      }
      const emailVerified = (user as AdapterUser).emailVerified;
      token.isVerified =
        typeof emailVerified === "boolean"
          ? emailVerified
          : emailVerified instanceof Date
            ? true
            : false;
    }
    return token;
  },
  /////////SESSION////////////////////////////////
  async session({
    session,
    token,
  }: {
    session: Session;
    token: JWT;
  }): Promise<Session> {
    // Expose role and verification status to client
    session.user.role = token.role;
    session.user.isVerified = token.isVerified;
    return session;
  },
};
export default authCallbacks;
