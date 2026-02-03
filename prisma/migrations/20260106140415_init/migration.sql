/*
  Warnings:

  - You are about to drop the column `priceInCents` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `barcode` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `variantValueId` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the `ProductVariantGroup` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[sku]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sku` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Made the column `sku` on table `ProductVariant` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_groupId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_variantValueId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariantGroup" DROP CONSTRAINT "ProductVariantGroup_productId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "priceInCents",
ADD COLUMN     "compareAtPrice" DECIMAL(65,30),
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "length" DOUBLE PRECISION,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "price" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
ADD COLUMN     "sku" TEXT NOT NULL,
ADD COLUMN     "tag" TEXT[],
ADD COLUMN     "urlHandle" TEXT,
ADD COLUMN     "weight" DOUBLE PRECISION,
ADD COLUMN     "width" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "barcode",
DROP COLUMN "groupId",
DROP COLUMN "variantValueId",
ADD COLUMN     "isAvailableForPurchase" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "sku" SET NOT NULL;

-- DropTable
DROP TABLE "ProductVariantGroup";

-- CreateTable
CREATE TABLE "ProductVariantValue" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "variantValueId" TEXT NOT NULL,

    CONSTRAINT "ProductVariantValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductDiscount" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProductDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductDiscount_productId_discountId_key" ON "ProductDiscount"("productId", "discountId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- AddForeignKey
ALTER TABLE "ProductVariantValue" ADD CONSTRAINT "ProductVariantValue_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantValue" ADD CONSTRAINT "ProductVariantValue_variantValueId_fkey" FOREIGN KEY ("variantValueId") REFERENCES "VariantValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDiscount" ADD CONSTRAINT "ProductDiscount_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDiscount" ADD CONSTRAINT "ProductDiscount_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
