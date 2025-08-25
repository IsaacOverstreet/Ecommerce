import { prisma } from "@/lib/db/client";
import { logger } from "@/lib/utils/logger";
import { NextResponse } from "next/server";

// Get all categories
export async function GET() {
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
export async function POST(request: Request) {
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
