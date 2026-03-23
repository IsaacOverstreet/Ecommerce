import axios from "axios";
// import type { Product, ProductWithRelations, Category } from "./database.types";
import { handleUiError } from "@/lib/errorHandlers/uiErrors";

import {
  ProductFilters,
  productQuerySchema,
} from "@/lib/validators/searchParams";
import { ProductResponse } from "@/app/types/productListTypes";
import z from "zod";

// export interface ProductFilters {
//   search?: string;
//   categoryId?: string;
//   availability?: "all" | "available" | "unavailable";
//   stockStatus?: "all" | "in_stock" | "low_stock" | "out_of_stock";
//   sortBy?:
//     | "price_asc"
//     | "price_desc"
//     | "newest"
//     | "oldest"
//     | "stock_asc"
//     | "stock_desc";
// }
export async function getProducts(payload: ProductFilters) {
  try {
    const validate = productQuerySchema.parse(payload);

    const res = await axios.get<ProductResponse>(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/view-Products`,
      { params: validate }
    );
    console.log("🚀 ~ getProducts ~ res:", res.data);
    if (!res.data) {
      throw new Error("Failed to fetch Products");
    }

    return res.data;
  } catch (error) {
    handleUiError(error);
  }
}

// export async function getProductById(
//   id: string
// ): Promise<ProductWithRelations | null> {}

// export async function toggleProductStatus(
//   id: string,
//   active: boolean
// ): Promise<Product> {
//   return updateProduct(id, { active });
// }

export async function getCategories() {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/category`
    );

    if (!res.data) {
      throw new Error("Failed to fetch categories");
    }
    return res.data || [];
  } catch (error) {
    handleUiError(error);
  }
}

export async function toggleProductStatus(id: string, productStatus: boolean) {
  try {
    // Validate inputs with Zod
    const productId = z
      .string()
      .uuid({ message: "Invalid product ID" })
      .parse(id);

    const status = z
      .boolean({ required_error: "Product status is required" })
      .parse(productStatus);

    const res = await axios.patch(`/api/admin/add-Product/${productId}`, {
      status,
    });
    if (!res.data) throw new Error("Failed to update");
    return res.data;
  } catch (error) {
    handleUiError(error);
  }
}
