import { prisma } from "@/lib/prisma/client";
import ProductForm from "./component/productForm";

export default async function AddProduct() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const variants = await prisma.variantType.findMany({
    include: { values: true },
  });

  const serializedCategories = categories.map((cat) => ({
    ...cat,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString(),
  }));

  const normalizeVariants = variants.map((variant) => ({
    ...variant,
    description: variant.description ?? "",
    createdAt: variant.createdAt.toISOString(),
    updatedAt: variant.updatedAt.toISOString(),
    values: variant.values.map((val) => ({
      ...val,
      hexCode: val.hexCode ?? "",
    })),
  }));

  return (
    <div className="mt-10 w-[100%] h-dvh">
      <ProductForm
        initialCategories={serializedCategories}
        initialVariants={normalizeVariants}
      />
    </div>
  );
}
