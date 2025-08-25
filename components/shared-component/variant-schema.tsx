import { z } from "zod";

export const variantSchema = z
  .object({
    name: z
      .string()
      .min(1, "name is required")
      .transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),
    description: z.string().optional(),
    values: z
      .array(
        z
          .string()
          .transform((val) => val.charAt(0).toUpperCase() + val.slice(1))
      )
      .default([]),
    colorName: z
      .string()
      .transform((val) => val.charAt(0).toUpperCase() + val.slice(1))
      .optional(),
    hexCode: z.string().toLowerCase().optional(),
    isColor: z.boolean(),
  })

  .superRefine((data, ctx) => {
    if (data.isColor) {
      if (!data.isColor || data.colorName?.trim() === "") {
        ctx.addIssue({
          path: ["colorName"],
          code: z.ZodIssueCode.custom,
          message: "color name is required when isColor is true",
        });
      }

      if (!data.hexCode || data.hexCode.trim() === "") {
        ctx.addIssue({
          path: ["hexCode"],
          code: z.ZodIssueCode.custom,
          message: "hexcode is required when isColor is true",
        });
      } else if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(data.hexCode.trim())) {
        ctx.addIssue({
          path: ["hexCode"],
          code: z.ZodIssueCode.custom,
          message: "Must be a valid 3 or 6-digit hex code starting with #",
        });
      }
    } else {
      if (!data.values || data.values.length === 0) {
        ctx.addIssue({
          path: ["values"],
          code: z.ZodIssueCode.custom,
          message:
            "At least one value is required when variant is not a color ",
        });
      }
    }
  });
export type Variant = z.infer<typeof variantSchema>;
