import { customAlphabet } from "nanoid";

/**
 *
 * @param productName - name of the prodiuct (e.g "T-SHIRT")
 *(e.g["RED", "COTTON"])
 */
export const generateProductSKU = (productName: string): string => {
  const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 4);
  const suffix = nanoid();

  const productCode = productName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.substring(0, 3).toUpperCase())
    .join("-");

  // Build SKU pattern
  const parts = [productCode, suffix].filter(Boolean).join("-");

  return parts;
};

/**
 *
 * @param baseSKU product sku from the generateProductSku function
 *  @param variantValues - Array of variant values. it's optional
 * @returns
 */
export function generateVariantSKU(baseSKU: string, variantValues: string[]) {
  if (!variantValues.length) return baseSKU;

  const variantCode = variantValues
    .map((v) => v.substring(0, 2).toUpperCase()) // keep short (e.g. RE, XL)
    .join("");

  return `${baseSKU}-${variantCode}`; // e.g. APP-TSH-3K2L-RXL
}
