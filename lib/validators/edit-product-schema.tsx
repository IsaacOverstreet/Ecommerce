import { z } from "zod";
import { numberFromString } from "@/utils/preproccessed";

//ProductSchema
export const EditProductFormSchema = z.object({
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
export type EditProductFormType = z.infer<typeof EditProductFormSchema>;

//ProductImageSchema
export const EditProductImageSchema = z
  .array(
    z
      .object({
        id: z
          .string({ required_error: "Image ID is required" })
          .min(1, "Image ID cannot be empty"),

        order: z
          .number({ required_error: "Order is required" })
          .int("Order must be an integer")
          .min(0, "Order cannot be negative"),

        publicId: z.string().nullable(),

        url: z.string().nullable(),

        file: z
          .instanceof(File, { message: "File must be a valid File object" })
          .nullable(),

        previewUrl: z
          .string({ required_error: "Preview URL is required" })
          .nullable(),

        isPrimary: z.boolean({ required_error: "isPrimary flag is required" }),

        altText: z.string().nullable().optional(),
      })
      .strict()
  )
  .min(1, "At least one product image is required")
  .refine(
    (images) => images.length === 0 || images.some((img) => img.isPrimary),
    {
      message: "One image must be set as primary",
    }
  );
export type EditProductImageType = z.infer<typeof EditProductImageSchema>;

//ProductCategorySchema
export const EditProductCategorySchema = z.array(z.string()).optional();
export type EditProductCategoryType = z.infer<typeof EditProductCategorySchema>;

//ProductVariantSchema
export const EditProductVariantSchema = z.array(
  z.object({
    id: z.string().min(1, "Variant id is required"),

    price: numberFromString("Product variant price must be a valid number"),

    quantity: numberFromString("Quantity must be a valid number").optional(),

    sku: z.string().min(1, "SKU is required"),

    values: z.array(z.string()).min(1, "Variant must have at least one value"),
  })
);
export type EditProductVariantType = z.infer<typeof EditProductVariantSchema>;

//Deeted image publicId
export const DeletedPublicIdSchema = z.array(z.string());

//Payload Schema
export const EditProductPayloadSchema = z.object({
  formData: EditProductFormSchema,
  images: EditProductImageSchema,
  selectedCategories: EditProductCategorySchema,
  editVariants: EditProductVariantSchema,
  deletePublicId: DeletedPublicIdSchema,
});

export type EditProductPayloadType = z.infer<typeof EditProductPayloadSchema>;
