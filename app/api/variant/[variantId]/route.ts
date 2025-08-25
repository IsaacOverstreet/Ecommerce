import { prisma } from "@/lib/db/client";
import { NextResponse } from "next/server";
import { EditingValueSchema } from "@/lib/utils/sharedUtils/validators";
import { logger } from "@/lib/utils/logger";

export async function PATCH(
  request: Request,
  context: { params: { variantId: string } }
) {
  try {
    const { variantId } = context.params;

    if (!variantId) {
      return NextResponse.json(
        { message: "failed to get Id" },
        { status: 400 }
      );
    }
    const body = await request.json();

    const validData = EditingValueSchema.safeParse(body.data);

    if (!validData.success) {
      return NextResponse.json({ message: "invalid values" }, { status: 400 });
    }
    const { id, name, hexCode } = validData.data;

    const existingVariantId = await prisma.variantType.findUnique({
      where: { id: variantId },
    });

    if (!existingVariantId) {
      return NextResponse.json(
        { message: "id does not exist" },
        { status: 404 }
      );
    }

    const existingVariantValue = await prisma.variantValue.findFirst({
      where: {
        variantTypeId: variantId, // the id you want to check
        name: name,
        NOT: {
          id: id, // 👈 exclude the record you're updating
        },
      },
    });

    if (existingVariantValue) {
      return NextResponse.json(
        { message: "New value already exist" },
        { status: 409 }
      );
    }

    const updateVariant = await prisma.variantValue.update({
      where: { id: id },
      data: { name, hexCode },
    });

    return NextResponse.json(updateVariant);
  } catch (error) {
    logger.error("failed to update variant", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { variantId: string } }
) {
  try {
    const { variantId } = await context.params;

    if (!variantId) {
      return NextResponse.json(
        { message: "failed to get Id" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { name } = body;

    const value = await prisma.variantValue.findUnique({
      where: { id: variantId },
    });

    if (!value || value.name !== name) {
      throw new Error("Variant value not found or name mismatch");
    }

    const updatedValue = await prisma.variantValue.delete({
      where: { id: variantId },
    });
    return NextResponse.json(updatedValue);
  } catch (error) {
    logger.error("failed to delete variant", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
