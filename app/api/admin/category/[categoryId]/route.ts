import { prisma } from "@/lib/prisma/client";
import { logger } from "@/utils/logger";

import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { categoryId: string } },
) {
  try {
    const { categoryId } = params;

    if (!categoryId) {
      return NextResponse.json(
        {
          message: "Id is needed",
        },
        { status: 400 },
      );
    }
    const { name, slug } = await request.json();

    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });
    if (existingCategory) {
      return NextResponse.json(
        { message: "Another category with this name already exists" },
        { status: 400 },
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
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryId: string } },
) {
  try {
    const { categoryId } = await params;
    if (!categoryId) {
      return NextResponse.json(
        {
          message: "Id is needed",
        },
        { status: 400 },
      );
    }

    //Check if category has been used
    const usedCount = await prisma.productCategory.count({
      where: {
        categoryId: categoryId,
      },
    });
    console.log("🚀 ~ usedCount:", usedCount);

    if (usedCount > 0) {
      return NextResponse.json(
        {
          message: "Cannot delete category: it is linked to products",
        },
        { status: 400 },
      );
    }
    console.log("asdsfdgh");
    const deleteCategory = await prisma.category.delete({
      where: { id: categoryId },
    });
    console.log("🚀 ~ deleteCategory:", deleteCategory);
    return NextResponse.json(deleteCategory);
  } catch (error) {
    logger.error("Failed to delete category", error);
    return NextResponse.json(
      { message: "Failed to delete category" },
      { status: 500 },
    );
  }
}
