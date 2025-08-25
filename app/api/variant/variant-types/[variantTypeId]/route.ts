import { prisma } from "@/lib/db/client";
import { logger } from "@/lib/utils/logger";
import { TitleEditSchema } from "@/lib/utils/sharedUtils/validators";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  context: { params: { variantTypeId: string } }
) {
  try {
    const { variantTypeId } = await context.params;

    const body = await request.json();

    const validateData = TitleEditSchema.safeParse(body);

    if (!validateData.success) {
      return NextResponse.json({ message: "Invalid Data" }, { status: 400 });
    }
    const { id, name, description } = validateData.data;
    const existingType = await prisma.variantType.findUnique({
      where: { name: name, NOT: { id } },
    });
    if (existingType) {
      return NextResponse.json(
        { message: "Variant type name already exists" },
        { status: 409 }
      );
    }

    const updateData = await prisma.variantType.update({
      where: { id: variantTypeId },
      data: { name, description },
    });
    return NextResponse.json({ data: updateData });
  } catch (error) {
    logger.error(error);
    return NextResponse.json(
      { message: "something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { variantTypeId: string } }
) {
  try {
    const { variantTypeId } = await context.params;

    if (!variantTypeId) {
      return NextResponse.json({ message: "Item not found" }, { status: 400 });
    }

    const existingVariantType = await prisma.variantType.findUnique({
      where: { id: variantTypeId },
      include: { values: true },
    });

    if (!existingVariantType) {
      return NextResponse.json(
        { message: "item does not exist" },
        { status: 404 }
      );
    }

    if (existingVariantType.values.length > 0) {
      return NextResponse.json(
        { message: "Cannot delete variant type. Remove all values first." },
        { status: 400 }
      );
    }

    await prisma.variantType.delete({ where: { id: variantTypeId } });
    return NextResponse.json(
      { message: "Variant type successfully deleted" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Delete Variant Type Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
