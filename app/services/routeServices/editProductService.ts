import { appError } from "@/lib/errorHandlers/appError";
import { prisma } from "@/lib/prisma/client";
import { EditProductPayloadType } from "@/lib/validators/edit-product-schema";
import { uploadFileToCloudinary } from "@/utils/cloudinaryImgUpload";
import { deleteFromCloudinary } from "@/utils/deleteFromCloudinary";

export async function editProductService(
  payload: EditProductPayloadType,
  productID: string
) {
  const { formData, images, selectedCategories, editVariants, deletePublicId } =
    payload;
  console.log("🚀 ~ editProductService ~ images:", images);

  const uploaded: {
    publicId: string;
    url: string;
    isPrimary: boolean;
  }[] = [];
  try {
    //////////////////////////Check if the product exist////////////////////////
    const existingProduct = await prisma.product.findUnique({
      where: { id: productID },
    });

    if (!existingProduct) {
      throw appError(404, "Product not found");
    }
    /////////////////////////////////////////////////////////////////////////////

    /////////////////////////Check if product sku exist//////////////////////////
    if (formData.sku) {
      const conflictingProduct = await prisma.product.findFirst({
        where: {
          sku: formData.sku,
          NOT: { id: productID },
        },
      });

      if (conflictingProduct) {
        throw appError(
          409,
          `Product SKU "${formData.sku}" already exists on another product`
        );
      }
    }
    ////////////////////////////////////////////////////////////////////////////////

    /////////////Fetch all existing SKUs for product varaint/////////////////////////
    const existingVariants = await prisma.productVariant.findMany({
      where: { productId: productID },
      include: {
        values: true,
      },
    });

    const existingSkuMap = new Map(existingVariants.map((s) => [s.sku, s.id]));

    // Loop through incoming variants and check SKU conflicts
    for (const variant of editVariants) {
      const existingId = existingSkuMap.get(variant.sku);
      if (existingId && existingId !== variant.id) {
        throw appError(
          409,
          `SKU "${variant.sku}" already exists for another variant of this product.`
        );
      }
    }
    //////////////////////////////////////////////////////////////////////////////////

    /////////////////////Upload new images to cloudinary//////////////////////////////
    const uploaded = await Promise.all(
      images
        .filter((img) => img.file)
        .map(async (img) => {
          const res = await uploadFileToCloudinary(img.file!);

          return {
            publicId: res.public_id,
            url: res.secure_url,
            isPrimary: img.isPrimary,
          };
        })
    );

    ///fetch images publicId////
    const existingImageIds = await prisma.productImage.findMany({
      where: { productId: productID },
      select: { publicId: true },
    });

    //////////////////////////////////////////////////////////////////////////////////

    ////START TRANSACTION///////////

    ////////////////////////Save product and images to DB//////////////////////////////////////
    const product = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: productID },
        data: formData,
      });

      //filter and delete old images ids from DB
      const validDeleteIds = deletePublicId.filter((id) =>
        existingImageIds.some((img) => img.publicId === id)
      );

      if (validDeleteIds.length > 0) {
        await tx.productImage.deleteMany({
          where: {
            productId: productID,
            publicId: { in: validDeleteIds },
          },
        });
      }

      // Update Existing Images
      for (const img of images) {
        if (!img.file && img.publicId) {
          await tx.productImage.updateMany({
            where: {
              productId: productID,
              publicId: img.publicId,
            },
            data: {
              isPrimary: img.isPrimary,
              order: img.order,
            },
          });
        }
      }

      /// Create New Images ////
      if (uploaded.length > 0) {
        await tx.productImage.createMany({
          data: uploaded.map((img, idx) => ({
            productId: updatedProduct.id,
            publicId: img.publicId,
            url: img.url!,
            isPrimary: img.isPrimary,
            altText: updatedProduct.name,
            order: idx,
          })),
        });
      }
      /////////////////////////////////////////////////////////////////////////////////

      /////////////////////////Add product category////////////////////////////

      // get existing categories linked to the product
      const existingCategoryLinks = await tx.productCategory.findMany({
        where: { productId: updatedProduct.id },
        select: { categoryId: true },
      });

      const existingCategoryIds = existingCategoryLinks.map(
        (link) => link.categoryId
      );

      const selectedCategoriesSafe = selectedCategories || [];

      //Pick category id to add
      const categoriesToAdd = selectedCategoriesSafe.filter(
        (id) => !existingCategoryIds.includes(id)
      );

      //Pick category id to remove
      const categoriesToRemove = existingCategoryIds.filter(
        (id) => !selectedCategoriesSafe.includes(id)
      );

      // Add new categories
      if (categoriesToAdd.length > 0) {
        await tx.productCategory.createMany({
          data: categoriesToAdd.map((categoryId) => ({
            productId: updatedProduct.id,
            categoryId,
          })),
          skipDuplicates: true, // safety in case of duplicates
        });
      }

      // Delete categories that has been removed
      if (categoriesToRemove.length > 0) {
        await tx.productCategory.deleteMany({
          where: {
            productId: updatedProduct.id,
            categoryId: { in: categoriesToRemove },
          },
        });
      }
      ///////////////////////////////////////////////////////////////////////////////

      ///////////////Edit variants/////////////////////////////////////////////
      const existingVariantMap = new Map(
        existingVariants.map((v) => [v.id, v])
      );

      const existingProductVariantsId = existingVariants.map((v) => v.id);

      const incomingProductvariantIds = new Set(editVariants.map((v) => v.id));

      const IdsToRemove = existingProductVariantsId.filter(
        (id) => !incomingProductvariantIds.has(id)
      );

      if (IdsToRemove.length > 0) {
        await tx.productVariant.deleteMany({
          where: {
            id: { in: IdsToRemove },
          },
        });
      }

      for (const v of editVariants) {
        const existing = existingVariantMap.get(v.id);

        if (!existing) {
          const newProductVariant = await tx.productVariant.create({
            data: {
              productId: updatedProduct.id,
              sku: v.sku,
              price: v.price,
              quantity: v.quantity,
              isAvailableForPurchase: updatedProduct.isAvailableForPurchase,
            },
          });

          await tx.productVariantValue.createMany({
            data: v.values.map((valueId) => ({
              variantId: newProductVariant.id,
              variantValueId: valueId,
            })),
            skipDuplicates: true,
          });
        } else {
          const existingValues = existing.values.map((v) => v.variantValueId);

          const valuesToAdd = v.values.filter(
            (val) => !existingValues.includes(val)
          );

          const valuesToRemove = existingValues.filter(
            (val) => !v.values.includes(val)
          );

          const valuesChanged =
            valuesToAdd.length > 0 || valuesToRemove.length > 0;

          const hasChanged =
            existing.sku !== v.sku ||
            Number(existing.price) !== v.price ||
            existing.quantity !== v.quantity ||
            valuesChanged;

          if (!hasChanged) continue;

          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              sku: v.sku,
              price: v.price,
              quantity: v.quantity,
              isAvailableForPurchase: updatedProduct.isAvailableForPurchase,
            },
          });

          await tx.productVariantValue.deleteMany({
            where: {
              variantId: v.id,
              variantValueId: { in: valuesToRemove },
            },
          });

          await tx.productVariantValue.createMany({
            data: valuesToAdd.map((valueId) => ({
              variantId: v.id,
              variantValueId: valueId,
            })),
            skipDuplicates: true,
          });
        }
      }
      ///////////////////////////////////////////////////////////////////////

      return updatedProduct;
    });

    const validDeleteIds = existingImageIds
      .filter((img) => img.publicId && deletePublicId.includes(img.publicId))
      .map((img) => img.publicId as string);

    await Promise.allSettled(
      validDeleteIds.map((id) => deleteFromCloudinary(id))
    );
    return product;
  } catch (error) {
    await Promise.allSettled(
      uploaded.map((img) => deleteFromCloudinary(img.publicId))
    );

    throw error;
  }
}
