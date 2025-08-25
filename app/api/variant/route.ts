import { variantSchema } from "@/components/shared-component/variant-schema";
import { prisma } from "@/lib/db/client";
import { logger } from "@/lib/utils/logger";
import { NewInputSchema } from "@/lib/utils/sharedUtils/validators";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    //////NEW LOGIC: Logic to add new variant value to existing variant type////////////////////////////
    if (body.variantTypeId && body.optionName) {
      const { optionName, hexCode, variantTypeId } = body;
      const validateData = NewInputSchema.safeParse({ optionName, hexCode });
      if (!validateData.success) {
        return NextResponse.json({ message: "Invalid input" }, { status: 400 });
      }

      const variantTypeExists = await prisma.variantType.findUnique({
        where: { id: variantTypeId },
      });
      if (!variantTypeExists) {
        return NextResponse.json(
          { message: "VariantType not found" },
          { status: 404 }
        );
      }

      // Check for duplicate name under this variantTypeId
      const duplicate = await prisma.variantValue.findFirst({
        where: {
          variantTypeId,
          name: optionName,
        },
      });
      if (duplicate) {
        return NextResponse.json(
          { message: "Variant value already exists" },
          { status: 409 }
        );
      }
      // Create the new VariantValue
      const newVariantValue = await prisma.variantValue.create({
        data: {
          name: optionName,
          hexCode,
          variantTypeId,
        },
      });

      return NextResponse.json({ success: true, data: newVariantValue });
    }

    ////////LOGIC TO CREATE NEW VARIANT FROM SCRATCH///////////////
    if (!Array.isArray(body)) {
      const validated = variantSchema.parse(body);
      const { name, description, values, isColor } = validated;

      if (isColor) {
        return NextResponse.json(
          { error: "Expected color variants as array, not single object" },
          { status: 400 }
        );
      }

      if (!values || values.length === 0) {
        return NextResponse.json(
          { error: "No values provided for value variant" },
          { status: 400 }
        );
      }

      const existingVariantType = await prisma.variantType.findUnique({
        where: {
          name,
        },
      });

      if (existingVariantType) {
        return NextResponse.json(
          {
            message: "Variant type exist",
          },
          { status: 400 }
        );
      }

      const variantType = await prisma.variantType.create({
        data: { name, description },
      });

      await prisma.variantValue.createMany({
        data: values.map((value: string) => ({
          name: value,
          variantTypeId: variantType.id,
        })),
      });
      return NextResponse.json({ success: true, data: variantType });
    }

    if (Array.isArray(body)) {
      // check if all the objects in the array are all colors
      const allColor = body.every((item) => item.isColor);

      if (!allColor) {
        return NextResponse.json(
          { error: "All items in array must be color variants" },
          { status: 400 }
        );
      }
      ///////////////////////////since all the boject in the array has the same name and description, then i can pick the first name and description to represent all.///////////////////////////////////////////
      const { name, description, isColor } = body[0];

      ///////Check if colorName and hexCode exist//////
      const invalid = body.some((item) => !item.colorName || !item.hexCode);
      if (invalid) {
        return NextResponse.json(
          { error: "Each color variant must include colorName and hexCode" },
          { status: 400 }
        );
      }

      const variantType = await prisma.variantType.create({
        data: { name, description, isColor },
      });

      await prisma.variantValue.createMany({
        data: body.map(({ colorName, hexCode }) => ({
          name: colorName,
          hexCode,
          variantTypeId: variantType.id,
        })),
      });
      return NextResponse.json({ success: true, data: variantType });
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "validation error",
          errors: error.errors,
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "internal server error",
        },
        { status: 500 }
      );
    }
  }
}

export async function GET() {
  try {
    const variants = await prisma.variantType.findMany({
      include: {
        values: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(variants);
  } catch (error) {
    logger.error("failed to fetch variant", error);
    return NextResponse.json(
      { message: "failed to fetch variant" },
      { status: 500 }
    );
  }
}
