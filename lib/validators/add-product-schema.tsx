import { z } from "zod";
import { numberFromString } from "@/utils/preproccessed";

//ProductSchema
export const ProductSchema = z.object({
  name: z
    .string({ required_error: "Product name is required" })
    .min(1, { message: "Product name cannot be empty" })
    .trim(),

  slug: z
    .string({ required_error: "Slug is required" })
    .min(1, { message: "Slug cannot be empty" })
    .trim(),

  description: z.string().optional(),

  price: z.preprocess(
    (val) => Number(val),
    z
      .number({ message: "Price must be a number" })

      .positive({ message: "Price must be positive" })
  ),

  compareAtPrice: numberFromString(
    "Compare price must be a valid number"
  ).optional(),

  quantity: numberFromString("Weight must be a valid number").optional(),

  trackQuantity: z.boolean({
    required_error: "Track quantity is required",
  }),

  isAvailableForPurchase: z.boolean({
    required_error: "Availability is required",
  }),

  active: z.boolean({
    required_error: "Active status is required",
  }),

  sku: z
    .string({ required_error: "SKU is required" })
    .min(1, { message: "SKU cannot be empty" }),

  weight: numberFromString("Weight must be a valid number").optional(),
  length: numberFromString("Length must be a valid number").optional(),
  width: numberFromString("Width must be a valid number").optional(),
  height: numberFromString("Height must be a valid number").optional(),

  tag: z.array(z.string().trim()).optional(),

  urlHandle: z.string().optional(),

  metaTitle: z
    .string()
    .max(60, { message: "Meta title must not exceed 60 characters" })

    .optional(),

  metaDescription: z
    .string()
    .max(160, {
      message: "Meta description must not exceed 160 characters",
    })
    .optional(),
});
export type ProductType = z.infer<typeof ProductSchema>;

//ProductImageSchema
export const ProductImageSchema = z
  .array(
    z.object({
      id: z.string().min(1).optional(),

      file: z.instanceof(File, {
        message: "Invalid file",
      }),

      previewUrl: z.string().url().optional(),

      isPrimary: z.boolean({ message: "primary image not set" }),
    })
  )
  .min(1, "At least one product image is required")
  .refine((images) => images.some((img) => img.isPrimary), {
    message: "One image must be set as primary",
  });
export type ProductImageType = z.infer<typeof ProductImageSchema>;

//ProductCategorySchema
export const ProductCategorySchema = z.array(z.string()).optional();
export type ProductCategoryType = z.infer<typeof ProductCategorySchema>;

//ProductVariantSchema
export const ProductVariantSchema = z.array(
  z.object({
    id: z.string().min(1, "Variant id is required"),

    price: z.preprocess(
      (val) => Number(val),
      z
        .number({ message: "Price must be a number" })

        .positive({ message: "Price must be positive" })
    ),
    quantity: numberFromString("Weight must be a valid number").optional(),

    sku: z.string().min(1, "SKU is required"),

    variantTypeId: z.string().min(1, "Variant type is required"),

    values: z
      .array(z.string().min(1))
      .min(1, "Variant must have at least one value"),
  })
);
export type ProductVariantType = z.infer<typeof ProductImageSchema>;

//Payload Schema
export const createProductPayloadSchema = z.object({
  productData: ProductSchema,
  images: ProductImageSchema,
  selectedCategories: ProductCategorySchema,
  productVariants: ProductVariantSchema,
});

export type CreateProductType = z.infer<typeof createProductPayloadSchema>;
