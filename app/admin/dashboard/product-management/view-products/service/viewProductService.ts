import { supabase } from "./supabase";
import type { Product, ProductWithRelations, Category } from "./database.types";

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  availability?: "all" | "available" | "unavailable";
  stockStatus?: "all" | "in_stock" | "low_stock" | "out_of_stock";
  sortBy?:
    | "price_asc"
    | "price_desc"
    | "created_asc"
    | "created_desc"
    | "stock_asc"
    | "stock_desc";
}

export async function getProducts(
  filters: ProductFilters = {}
): Promise<ProductWithRelations[]> {
  let query = supabase
    .from("products")
    .select(
      `
      *,
      images(*),
      variants(*),
      product_categories!inner(
        categories(*)
      )
    `
    )
    .is("deleted_at", null);

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`
    );
  }

  if (filters.categoryId) {
    query = query.eq("product_categories.category_id", filters.categoryId);
  }

  if (filters.availability === "available") {
    query = query.eq("is_available", true);
  } else if (filters.availability === "unavailable") {
    query = query.eq("is_available", false);
  }

  if (filters.stockStatus === "in_stock") {
    query = query.gt("quantity", 10);
  } else if (filters.stockStatus === "low_stock") {
    query = query.gt("quantity", 0).lte("quantity", 10);
  } else if (filters.stockStatus === "out_of_stock") {
    query = query.eq("quantity", 0);
  }

  if (filters.sortBy === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (filters.sortBy === "price_desc") {
    query = query.order("price", { ascending: false });
  } else if (filters.sortBy === "created_asc") {
    query = query.order("created_at", { ascending: true });
  } else if (filters.sortBy === "created_desc") {
    query = query.order("created_at", { ascending: false });
  } else if (filters.sortBy === "stock_asc") {
    query = query.order("quantity", { ascending: true });
  } else if (filters.sortBy === "stock_desc") {
    query = query.order("quantity", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    throw error;
  }

  return (data || []).map((product: any) => ({
    ...product,
    categories:
      product.product_categories
        ?.map((pc: any) => pc.categories)
        .filter(Boolean) || [],
  }));
}

export async function getProductById(
  id: string
): Promise<ProductWithRelations | null> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      images(*),
      variants(*),
      product_categories(
        categories(*)
      )
    `
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("Error fetching product:", error);
    throw error;
  }

  if (!data) return null;

  return {
    ...data,
    categories:
      data.product_categories
        ?.map((pc: any) => pc.categories)
        .filter(Boolean) || [],
  };
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating product:", error);
    throw error;
  }

  return data;
}

export async function toggleProductStatus(
  id: string,
  active: boolean
): Promise<Product> {
  return updateProduct(id, { active });
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }

  return data || [];
}
