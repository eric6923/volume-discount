/*
  Warnings:

  - You are about to drop the `ProductMetadata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VolumeDiscount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductMetadata" DROP CONSTRAINT "ProductMetadata_shopId_fkey";

-- DropForeignKey
ALTER TABLE "VolumeDiscount" DROP CONSTRAINT "VolumeDiscount_shopId_fkey";

-- DropTable
DROP TABLE "ProductMetadata";

-- DropTable
DROP TABLE "VolumeDiscount";

-- CreateTable
CREATE TABLE "QuantityDiscount" (
    "id" TEXT NOT NULL,
    "shopifyDiscountId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "configuration" JSONB NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuantityDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuantityDiscount_shop_idx" ON "QuantityDiscount"("shop");

-- CreateIndex
CREATE INDEX "QuantityDiscount_shopifyDiscountId_idx" ON "QuantityDiscount"("shopifyDiscountId");
