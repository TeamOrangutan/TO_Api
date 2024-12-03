/*
  Warnings:

  - You are about to drop the column `subToal` on the `FAC_PRODUCTO` table. All the data in the column will be lost.
  - Added the required column `subTotal` to the `FAC_PRODUCTO` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FAC_PRODUCTO" DROP COLUMN "subToal",
ADD COLUMN     "subTotal" DECIMAL(65,30) NOT NULL;
