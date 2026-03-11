import { handleUiError } from "@/lib/errorHandlers/uiErrors";
import {
  createProductPayloadSchema,
  CreateProductType,
} from "@/lib/validators/add-product-schema";

import axios from "axios";

type SuccessResponse = {
  message: string;
};

export async function publishProduct(payload: CreateProductType) {
  try {
    const validate = createProductPayloadSchema.parse(payload);
    console.log("🚀 ~ publishProduct ~ validate:", validate);

    const { productData, selectedCategories, productVariants, images } =
      validate;

    const formData = new FormData();

    formData.append("productData", JSON.stringify(productData));
    formData.append("selectedCategories", JSON.stringify(selectedCategories));
    formData.append("productVariants", JSON.stringify(productVariants));

    images.forEach((img) => {
      formData.append("images", img.file);
      formData.append(
        "images_meta",
        JSON.stringify({ isPrimary: img.isPrimary })
      );
    });

    const res = await axios.post<SuccessResponse>(
      "/api/admin/add-Product",
      formData,
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
