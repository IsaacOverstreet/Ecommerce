import { PrismaClient } from "@prisma/client";

import { verifyPassword } from "@/lib/utils/password";
const prisma = new PrismaClient();

// Find user
export async function verifyAdminCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  // admin check
  if (!user || user !== "ADMIN") return null;
  if (!user.active || user.deletedAt) return null;
  if (!user.passwordHash) return null;

  // password verification
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return null;

  return {
    id: user.id,
    email: user.email,
    name: `${user.firstName}`,
    role: user.role,
  };
}
