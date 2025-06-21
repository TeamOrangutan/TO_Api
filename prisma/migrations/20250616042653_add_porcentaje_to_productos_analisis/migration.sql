/*
  Warnings:

  - Added the required column `porcentaje` to the `ProductoAnalisis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductoAnalisis" ADD COLUMN     "porcentaje" DOUBLE PRECISION NOT NULL;
