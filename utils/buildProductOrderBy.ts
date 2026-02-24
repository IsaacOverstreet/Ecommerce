import { ProductFilters } from "@/app/api/admin/view-Products/route";
import { Prisma } from "@prisma/client";

const SORT_MAP: Record<
  NonNullable<ProductFilters["sortBy"]>,
  Prisma.ProductOrderByWithRelationInput[]
> = {
  price_asc: [{ price: "asc" }],
  price_desc: [{ price: "desc" }],
  newest: [{ createdAt: "desc" }],
  oldest: [{ createdAt: "asc" }],
  stock_asc: [{ quantity: "asc" }, { createdAt: "desc" }],
  stock_desc: [{ quantity: "desc" }, { createdAt: "desc" }],
};
export function buildProductOrderBy(sortBy?: ProductFilters["sortBy"]) {
  return SORT_MAP[sortBy ?? "newest"];
}
