import { withErrorHandler } from "@/lib/errorHandlers/apiErrors";

import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/utils/requireAdmin";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const session = await requireAdmin(req);

  // If session returned a NextResponse, it means unauthorized
  if (session instanceof NextResponse) return session;

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  const productId = z
    .string()
    .uuid({ message: "Invalid product ID" })
    .parse(id);

  const { status } = await req.json();
  const productStatus = z
    .boolean({ required_error: "Product status is required" })
    .parse(status);

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      active: productStatus,
    },
  });

  return NextResponse.json(updatedProduct);
});
