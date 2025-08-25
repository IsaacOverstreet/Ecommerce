import { prisma } from "@/lib/db/client";
import { logger } from "@/lib/utils/logger";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { categoryId } = params;
   

    if (!categoryId) {
      return NextResponse.json(
        {
          message: "Id is needed",
        },
        { status: 400 }
      );
    }
    const { name, slug } = await request.json();

    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });
    if (existingCategory) {
      return NextResponse.json(
        { message: "Another category with this name already exists" },
        { status: 400 }
      );
    }
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: { name, slug },
    });
    return NextResponse.json(category);
  } catch (error) {
    logger.error("failed to create category", error);

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { categoryId } = params;
    if (!categoryId) {
      return NextResponse.json(
        {
          message: "Id is needed",
        },
        { status: 400 }
      );
    }

    const deleteCategory = await prisma.category.delete({
      where: { id: categoryId },
    });
    return NextResponse.json(deleteCategory);
  } catch (error) {
    logger.error("Failed to delete category", error);
    return NextResponse.json(
      { message: "Failed to delete category" },
      { status: 500 }
    );
  }
}
