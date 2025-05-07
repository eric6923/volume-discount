/*
  Warnings:

  - You are about to drop the column `configuration` on the `QuantityDiscount` table. All the data in the column will be lost.
  - You are about to drop the column `endsAt` on the `QuantityDiscount` table. All the data in the column will be lost.
  - You are about to drop the column `shop` on the `QuantityDiscount` table. All the data in the column will be lost.
  - You are about to drop the column `shopifyDiscountId` on the `QuantityDiscount` table. All the data in the column will be lost.
  - You are about to drop the column `startsAt` on the `QuantityDiscount` table. All the data in the column will be lost.
  - Added the required column `shopId` to the `QuantityDiscount` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "QuantityDiscount_shop_idx";

-- DropIndex
DROP INDEX "QuantityDiscount_shopifyDiscountId_idx";

-- AlterTable
ALTER TABLE "QuantityDiscount" DROP COLUMN "configuration",
DROP COLUMN "endsAt",
DROP COLUMN "shop",
DROP COLUMN "shopifyDiscountId",
DROP COLUMN "startsAt",
ADD COLUMN     "appliesTo" TEXT NOT NULL DEFAULT 'all',
ADD COLUMN     "combineWithOrderDiscounts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "combineWithProductDiscounts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "combineWithShippingDiscounts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "productIds" TEXT[],
ADD COLUMN     "shopId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "QuantityDiscountTier" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "maxQuantity" INTEGER,
    "discountType" TEXT NOT NULL DEFAULT 'percentage',
    "discountValue" DOUBLE PRECISION NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuantityDiscountTier_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuantityDiscountTier" ADD CONSTRAINT "QuantityDiscountTier_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "QuantityDiscount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
