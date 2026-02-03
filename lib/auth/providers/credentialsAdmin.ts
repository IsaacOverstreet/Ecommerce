import CredentialsProvider from "next-auth/providers/credentials";
import { ratelimit } from "@/utils/ratelimit";
import { verifyAdminCredentials } from "../actions/admin";
import { adminLoginSchema } from "../schemas/auth";
import { logger } from "@/utils/logger";
// 3️⃣ Admin: Email + Password
export const credentialsProviderAdmin = CredentialsProvider({
  id: "admin-credentials",
  name: "Admin",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    // Rate limiting
    try {
      const validated = adminLoginSchema.parse(credentials);
      const { success } = await ratelimit.limit(`admin:${validated.email}`);
      if (!success) throw new Error("Too many attempts");
      const user = await verifyAdminCredentials(
        validated.email,
        validated.password
      );
      return user ?? null;
    } catch (error) {
      logger.error("Admin login error:", error);
      return null;
    }
  },
});
