/*
  Warnings:

  - You are about to drop the column `address` on the `FailedPayment` table. All the data in the column will be lost.
  - You are about to drop the column `network` on the `FailedPayment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FailedPayment" DROP COLUMN "address",
DROP COLUMN "network";
