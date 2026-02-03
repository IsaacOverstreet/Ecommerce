import { PrismaClient } from "@prisma/client";
import { logger } from "@/utils/logger";

const prisma = new PrismaClient();

export async function handleCustomerLogin(user: {
  id?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}) {
  if (!user?.email) {
    logger.error("Customer login: missing email");
    return null;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });
    if (existingUser) {
      // optional: update name or image if they are updated
      if (
        existingUser.name !== user.name ||
        existingUser.image !== user.image
      ) {
        await prisma.user.update({
          where: { email: user.email },
          data: {
            name: user.name || undefined,
            image: user.image || undefined,
          },
        });
      }
      return existingUser;
    }

    // for new users
    const newUser = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name || "Customer",
        image: user.image,
        role: "CUSTOMER",
      },
    });

    logger.info("New customer created:", { email: user.email });
    return newUser;
  } catch (error) {
    logger.error("customer login failed", { error, email: user.email });
    return null;
  }
}
