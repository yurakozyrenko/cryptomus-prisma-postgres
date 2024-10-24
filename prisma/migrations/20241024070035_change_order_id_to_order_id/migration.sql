/*
  Warnings:

  - You are about to drop the column `order_id` on the `FailedPayment` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `FailedPayout` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `SuccessPayment` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `SuccessfulPayout` table. All the data in the column will be lost.
  - Added the required column `orderId` to the `FailedPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `FailedPayout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `Payout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `SuccessPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `SuccessfulPayout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FailedPayment" DROP COLUMN "order_id",
ADD COLUMN     "orderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FailedPayout" DROP COLUMN "order_id",
ADD COLUMN     "orderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "order_id",
ADD COLUMN     "orderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payout" DROP COLUMN "order_id",
ADD COLUMN     "orderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SuccessPayment" DROP COLUMN "order_id",
ADD COLUMN     "orderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SuccessfulPayout" DROP COLUMN "order_id",
ADD COLUMN     "orderId" TEXT NOT NULL;
