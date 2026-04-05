import { createProductService } from "@/app/services/routeServices/createProductService";
import { withErrorHandler } from "@/lib/errorHandlers/apiErrors";

import { createProductPayloadSchema } from "@/lib/validators/add-product-schema";

import { NextRequest, NextResponse } from "next/server";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const formData = await req.formData();
  const productData = JSON.parse(formData.get("productData") as string);
  const selectedCategories = JSON.parse(
    formData.get("selectedCategories") as string,
  );
  const productVariants = JSON.parse(formData.get("productVariants") as string);
  const files = formData.getAll("images") as File[];

  const metas = formData
    .getAll("images_meta")
    .map((m) => JSON.parse(m as string));
  const images = files.map((file, index) => ({
    file,
    isPrimary: Boolean(metas[index]?.isPrimary),
  }));

  const data = {
    productData,
    images,
    selectedCategories,
    productVariants,
  };

  const validate = createProductPayloadSchema.parse(data);

  const product = await createProductService(validate);

  return NextResponse.json({
    message: "Product created successfully",
    product,
  });
});
