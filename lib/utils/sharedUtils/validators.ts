import z from "zod";

export const TitleEditSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters long" })
    .transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),
  description: z.string().toLowerCase().optional(),
});
export type TitleEdit = z.infer<typeof TitleEditSchema>;

export const EditingValueSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters long" })
    .transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),
  hexCode: z
    .string()
    .toLowerCase()
    .optional()
    .nullable()
    .transform((val) => val ?? undefined)
    .refine(
      (val) => !val || /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(val.trim()),
      {
        message: "Invalid hex code format. Use #fff or #ffffff.",
      }
    ),
});

export type EditingValue = z.infer<typeof EditingValueSchema>;

export const NewInputSchema = z.object({
  optionName: z
    .string()
    .transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),
  hexCode: z
    .string()
    .toLowerCase()
    .optional()
    .refine(
      (val) => !val || /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(val.trim()),
      {
        message: "Must be a valid 3 or 6-digit hex code starting with #",
      }
    ),
});
export type NewInput = z.infer<typeof NewInputSchema>;
