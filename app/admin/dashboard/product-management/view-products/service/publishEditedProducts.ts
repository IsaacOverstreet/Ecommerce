import { handleUiError } from "@/lib/errorHandlers/uiErrors";

import {
  EditProductPayloadSchema,
  EditProductPayloadType,
} from "@/lib/validators/edit-product-schema";

import axios from "axios";
import z from "zod";

type SuccessResponse = {
  message: string;
};

export async function publishEditedProduct(
  payload: EditProductPayloadType,
  prodID: string
) {
  try {
    const validate = EditProductPayloadSchema.parse(payload);
    if (!validate) {
      return "failed to validate";
    }

    const productID = z.string().uuid().parse(prodID);
    if (!productID) {
      return "failed to validate";
    }

    const {
      formData,
      selectedCategories,
      editVariants,
      images,
      deletePublicId,
    } = validate;

    const form = new FormData();

    form.append("formData", JSON.stringify(formData));

    form.append("selectedCategories", JSON.stringify(selectedCategories));

    form.append("deletePublicId", JSON.stringify(deletePublicId));

    form.append("editVariants", JSON.stringify(editVariants));

    images.forEach((img) => {
      if (img.file) {
        form.append(`file_${img.id}`, img.file);
      }
      form.append(
        "images_meta",
        JSON.stringify({
          isPrimary: img.isPrimary,
          previewUrl: img.previewUrl,
          url: img.url,
          order: img.order,
          id: img.id,
          publicId: img.publicId,
        })
      );
    });

    const res = await axios.put<SuccessResponse>(
      `/api/admin/edit-Product/${productID}`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    console.log("🚀 ~ publishProduct ~ res:", res.data);

    return res.data;
  } catch (error) {
    throw handleUiError(error);
  }
}

// return Response.json(
//   {
//     success: true,
//     message: "Product published successfully",
//     data: {
//       id: product.id,
//       slug: product.slug,
//       status: "PUBLISHED",
//     },
//   },
//   { status: 201 }
// );
