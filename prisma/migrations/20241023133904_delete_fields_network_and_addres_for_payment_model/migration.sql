/*
  Warnings:

  - You are about to drop the column `address` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `network` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "address",
DROP COLUMN "network";
