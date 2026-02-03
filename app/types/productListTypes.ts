export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;

  price: number;
  compareAtPrice?: number;

  quantity: number;
  trackQuantity: boolean;
  isAvailableForPurchase: boolean;
  active: boolean;

  sku: string;

  weight?: number;
  length?: number;
  width?: number;
  height?: number;

  tag: string[];

  urlHandle?: string;
  metaTitle?: string;
  metaDescription?: string;

  createdAt: string; // ISO string
  updatedAt: string;

  images: ProductImage[];
  categories: ProductCategory[];
  variants: ProductVariant[];
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  order: number;
  isPrimary: boolean;
}
export interface ProductCategory {
  id: string;
  categoryId: string;
  name: string;
}
export interface ProductVariant {
  id: string;
  sku: string;
  price?: number;
  quantity: number;
  isAvailableForPurchase: boolean;

  values: ProductVariantValue[];
}
export interface ProductVariantValue {
  id: string;
  value: string;
  type: string; // e.g. "Color", "Size"
}
