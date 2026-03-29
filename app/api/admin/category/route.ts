import { prisma } from "@/lib/prisma/client";
import { logger } from "@/utils/logger";
import { requireAdmin } from "@/utils/requireAdmin";
import { NextRequest, NextResponse } from "next/server";

// Get all categories
export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);

  // If session returned a NextResponse, it means unauthorized
  if (session instanceof NextResponse) return session;

  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    logger.error("Failed to fetch categories", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// Post new category
export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);

  // If session returned a NextResponse, it means unauthorized
  if (session instanceof NextResponse) return session;

  try {
    const { name, slug } = await request.json();
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });
    if (existingCategory) {
      return NextResponse.json(
        { message: "Category already exist" },
        { status: 400 }
      );
    }
    const category = await prisma.category.create({ data: { name, slug } });
    return NextResponse.json(category);
  } catch (error) {
    logger.error("Failed to create category", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
