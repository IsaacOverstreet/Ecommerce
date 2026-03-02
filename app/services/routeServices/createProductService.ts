import { appError } from "@/lib/errorHandlers/appError";
import { prisma } from "@/lib/prisma/client";
import { CreateProductType } from "@/lib/validators/add-product-schema";
import { uploadFileToCloudinary } from "@/utils/cloudinaryImgUpload";
import { deleteFromCloudinary } from "@/utils/deleteFromCloudinary";

export async function createProductService(payload: CreateProductType) {
  const { productData, images, selectedCategories, productVariants } = payload;

  const uploaded: { publicId: string; url: string; isPrimary: boolean }[] = [];
  try {
    for (const img of images) {
      const res = await uploadFileToCloudinary(img.file);
      uploaded.push({
        publicId: res.public_id,
        url: res.secure_url,
        isPrimary: img.isPrimary || false,
      });
    }

    // Save product to DB
    const product = await prisma.$transaction(async (tx) => {
      const existingProduct = await tx.product.findUnique({
        where: { slug: productData.slug },
        select: { id: true },
      });

      if (existingProduct) {
        throw appError(409, "A product with this slug already exists");
      }
      const newProduct = await tx.product.create({
        data: productData,
      });

      console.log("hgsdbgdhjds");

      // Add product Image
      if (uploaded.length > 0) {
        await tx.productImage.createMany({
          data: uploaded.map((img, idx) => ({
            productId: newProduct.id,
            publicId: img.publicId,
            url: img.url,
            isPrimary: img.isPrimary,
            altText: newProduct.name,
            order: idx,
          })),
        });
      }

      //Add product category
      const existingCategory = await tx.category.findMany({
        where: { id: { in: selectedCategories } },
        select: { id: true },
      });

      if (existingCategory.length !== selectedCategories?.length) {
        throw appError(404, "One or more categories do not exist");
      }
      await tx.productCategory.createMany({
        data: selectedCategories.map((categoryId) => ({
          productId: newProduct.id,
          categoryId,
        })),
        skipDuplicates: true,
      });

      // Validate SKUs
      const existingSku = await tx.productVariant.findFirst({
        where: { sku: { in: productVariants.map((v) => v.sku) } },
      });
      if (existingSku) {
        throw appError(409, `SKU already exists: ${existingSku.sku}`);
      }

      //Add productVariant
      const selectedVariantValues = [
        ...new Set(productVariants.flatMap((v) => v.values)),
      ];

      const existingVariantValues = await tx.variantValue.findMany({
        where: { id: { in: selectedVariantValues } },
        select: { id: true },
      });

      if (existingVariantValues.length !== selectedVariantValues.length) {
        throw appError(400, "One or more variant values do not exist");
      }

      for (const prod of productVariants) {
        const newProductVariant = await tx.productVariant.create({
          data: {
            productId: newProduct.id,
            sku: prod.sku,
            price: prod.price,
            quantity: prod.quantity,
            isAvailableForPurchase: newProduct.isAvailableForPurchase,
          },
        });

        await tx.productVariantValue.createMany({
          data: prod.values.map((v) => ({
            variantId: newProductVariant.id,
            variantValueId: v,
          })),
          skipDuplicates: true,
        });
      }
      return newProduct;
    });
    return product;
  } catch (error) {
    await Promise.allSettled(
      uploaded.map((img) => deleteFromCloudinary(img.publicId))
    );

    throw error;
  }
}
