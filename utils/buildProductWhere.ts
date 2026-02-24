import { ProductFilters } from "@/app/api/admin/view-Products/route";
import { Prisma } from "@prisma/client";
export function buildProductWhere(
  filters: ProductFilters
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { sku: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.categoryId) {
    where.categories = {
      some: { categoryId: filters.categoryId },
    };
  }

  if (filters.availability === "available") {
    where.isAvailableForPurchase = true;
  }

  if (filters.availability === "unavailable") {
    where.isAvailableForPurchase = false;
  }

  if (filters.stockStatus === "in_stock") {
    where.quantity = { gt: 10 };
  }

  if (filters.stockStatus === "low_stock") {
    where.quantity = { gt: 0, lte: 10 };
  }

  if (filters.stockStatus === "out_of_stock") {
    where.quantity = 0;
  }

  return where;
}
