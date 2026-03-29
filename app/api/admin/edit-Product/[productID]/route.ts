import { editProductService } from "@/app/services/routeServices/editProductService";
import { withErrorHandler } from "@/lib/errorHandlers/apiErrors";

import { EditProductPayloadSchema } from "@/lib/validators/edit-product-schema";
import { requireAdmin } from "@/utils/requireAdmin";

import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export const PUT = withErrorHandler(async (req: NextRequest) => {
  const session = await requireAdmin(req);

  // If session returned a NextResponse, it means unauthorized
  if (session instanceof NextResponse) return session;

  const url = req.nextUrl;
  const segments = url.pathname.split("/");
  const productID = segments[segments.length - 1];

  const form = await req.formData();
  const formData = JSON.parse(form.get("formData") as string);
  console.log("🚀 ~ PUT ~ formData:", formData);

  const selectedCategories = JSON.parse(
    form.get("selectedCategories") as string
  );
  const deletePublicId = JSON.parse(form.get("deletePublicId") as string);

  const editVariants = JSON.parse(form.get("editVariants") as string);

  const metas = form.getAll("images_meta").map((m) => JSON.parse(m as string));

  const images = metas.map((m) => {
    const files = form.getAll(`file_${m.id}`) as File[];
    const file = files[0] || null; // pick the first file or null

    return {
      id: m.id,
      isPrimary: m.isPrimary,
      publicId: m.publicId,
      previewUrl: m.previewUrl,
      url: m.url,
      order: m.order,
      file,
    };
  });

  const data = {
    formData,
    images,
    selectedCategories,
    editVariants,
    deletePublicId,
  };

  const validate = EditProductPayloadSchema.parse(data);

  const checkProductId = z.string().uuid().parse(productID);

  const product = await editProductService(validate, checkProductId);

  return NextResponse.json({
    message: "Product Edited successfully",
    product,
  });
});
