import { withErrorHandler } from "@/lib/errorHandlers/apiErrors";
import { prisma } from "@/lib/prisma/client";
import { productQuerySchema } from "@/lib/validators/searchParams";
import { buildProductOrderBy } from "@/utils/buildProductOrderBy";
import { buildProductWhere } from "@/utils/buildProductWhere";
import { normalizeProduct } from "@/utils/normalizeProduct";
import { requireAdmin } from "@/utils/requireAdmin";
import { NextRequest, NextResponse } from "next/server";

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  availability?: "all" | "available" | "unavailable";
  stockStatus?: "all" | "in_stock" | "low_stock" | "out_of_stock";
  sortBy?:
    | "price_asc"
    | "price_desc"
    | "newest"
    | "oldest"
    | "stock_asc"
    | "stock_desc";
}

export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await requireAdmin(req);

  // If session returned a NextResponse, it means unauthorized
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const lim = Number(searchParams.get("page"));
  console.log("page", lim);

  const sortBy = searchParams.get("sortBy") ?? "newest";

  const stockStatus = searchParams.get("stockStatus") ?? "";
  const availability = searchParams.get("availability") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const search = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page") ?? 1);
  console.log("🚀 ~ GET ~ page:", page);
  const limit = Number(searchParams.get("limit") ?? 20);

  const validated = productQuerySchema.parse({
    search,
    page,
    limit,
    categoryId,
    availability,
    stockStatus,
    sortBy,
  });
  console.log("🚀 ~ GET ~ validated:", validated);

  const skip = (validated.page - 1) * validated.limit;

  const where = buildProductWhere(validated);
  const orderBy = buildProductOrderBy(validated.sortBy);

  const [product, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: validated.limit,
      include: {
        images: true,
        categories: true,
        variants: {
          include: {
            values: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const normalizedProducts = product.map(normalizeProduct);

  return NextResponse.json({
    data: normalizedProducts,
    meta: {
      total,
      page: validated.page,
      limit: validated.limit,
      totalPages: Math.ceil(total / validated.limit),
    },
  });
});
