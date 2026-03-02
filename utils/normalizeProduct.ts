import { Prisma } from "@prisma/client";

import { Decimal } from "@prisma/client/runtime/client";

export type prismaProduct = Prisma.ProductGetPayload<{
  include: {
    images: true;
    categories: true;
    variants: {
      include: {
        values: true;
      };
    };
  };
}>;

function isDecimal(value: unknown): value is Decimal {
  return value instanceof Decimal;
}

const toISOStringSafe = (date: Date | string) =>
  date instanceof Date ? date.toISOString() : new Date(date).toISOString();

function normalizeImageUrl(url: string) {
  if (!url) {
    return "url not found";
  }
  return url.startsWith("http")
    ? url
    : `https://res.cloudinary.com/YOUR_CLOUD_NAME/${url}`;
}

export function normalizeProduct(products: prismaProduct) {
  return {
    ...products,
    description: products.description ?? "",
    price: isDecimal(products.price)
      ? products.price.toNumber()
      : Number(products.price),
    compareAtPrice: isDecimal(products.compareAtPrice)
      ? products.compareAtPrice.toNumber()
      : Number(products.compareAtPrice),
    createdAt: toISOStringSafe(products.createdAt),
    updatedAt: toISOStringSafe(products.updatedAt),
    deletedAt: products.deletedAt ? toISOStringSafe(products.deletedAt) : null,
    images:
      products.images.map((img) => ({
        ...img,
        url: normalizeImageUrl(img.url),
      })) ?? [],
    categories: products.categories.map((cat) => cat),
    variants: products.variants.map((variant) => ({
      ...variant,
      price: isDecimal(variant.price)
        ? variant.price.toNumber()
        : Number(products.price),
      values: variant.values.map((val) => val),
    })),
  };
}
