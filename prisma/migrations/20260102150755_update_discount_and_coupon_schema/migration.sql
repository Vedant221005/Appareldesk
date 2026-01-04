/*
  Warnings:

  - You are about to drop the column `expiryDate` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `isUsed` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `usedAt` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `discountPercent` on the `DiscountOffer` table. All the data in the column will be lost.
  - Added the required column `name` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountType` to the `DiscountOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountValue` to the `DiscountOffer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "expiryDate",
DROP COLUMN "isUsed",
DROP COLUMN "usedAt",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxUsageCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxUsagePerUser" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "usedCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "DiscountOffer" DROP COLUMN "discountPercent",
ADD COLUMN     "discountType" "DiscountType" NOT NULL,
ADD COLUMN     "discountValue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "maxDiscountAmount" DOUBLE PRECISION,
ADD COLUMN     "minOrderAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
