// scripts/create-admin.ts
import "dotenv/config";
import { prisma } from "@/lib/prisma/client";
import { hashPassword } from "@/utils/password";

console.log("Loaded DB URL:", process.env.DATABASE_URL);

async function createAdmin() {
  const email = "morakinyorisaac@yahoo.com";
  const password = "Qwertyuiop";

  const hashedPassword = await hashPassword(password);

  try {
    const admin = await prisma.admin.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: hashedPassword,
        name: "Admin1",
      },
    });

    console.log("Admin created:", admin.email);
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
