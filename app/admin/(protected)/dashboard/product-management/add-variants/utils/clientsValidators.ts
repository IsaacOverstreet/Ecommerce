// Incase of zode error btw the variant client or variant api use this validator///////

// import { z } from "zod";
// export const NewInputSchema = z.object({
//   optionName: z
//     .string()
//     .transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),
//   hexCode: z
//     .string()
//     .toLowerCase()
//     .optional()
//     .refine(
//       (val) => !val || /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(val.trim()),
//       {
//         message: "Must be a valid 3 or 6-digit hex code starting with #",
//       }
//     ),
// });
// export type NewInput = z.infer<typeof NewInputSchema>;

// export const EditingValueSchema = z.object({
//   id: z.string(),
//   name: z
//     .string()
//     .trim()
//     .transform((val) => val.charAt(0).toUpperCase() + val.slice(1))
//     .optional()
//     .nullable(),
//   hexCode: z
//     .string()
//     .toLowerCase()
//     .optional()
//     .nullable()
//     .transform((val) => val ?? undefined)
//     .refine(
//       (val) => !val || /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(val.trim()),
//       {
//         message: "Must be a valid 3 or 6-digit hex code starting with #",
//       }
//     ),
// });

// export type EditingValue = z.infer<typeof EditingValueSchema>;
