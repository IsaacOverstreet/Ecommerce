import { z } from "zod";

/**
 * Helpers
 */
const emptyToUndefined = z.literal("").transform(() => undefined);

/**
 * Main query schema
 */
export const productQuerySchema = z.object({
  //  Search
  search: z
    .string()
    .optional()
    .default("")
    .transform((val) => val.trim()),

  //  Pagination
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),

  //  Sorting
  sortBy: z
    .union([
      z.enum([
        "newest",
        "oldest",
        "price_asc",
        "price_desc",
        "stock_asc",
        "stock_desc",
      ]),
      emptyToUndefined,
    ])
    .default("newest"),

  // Stock
  stockStatus: z
    .union([
      z.enum(["all", "in_stock", "low_stock", "out_of_stock"]),
      emptyToUndefined,
    ])
    .default("all"),

  //  Availability
  availability: z
    .union([z.enum(["all", "available", "unavailable"]), emptyToUndefined])
    .default("all"),

  //  Category
  categoryId: z
    .union([z.string().uuid(), z.literal("")])
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
});
export type ProductFilters = z.infer<typeof productQuerySchema>;
