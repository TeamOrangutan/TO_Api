/*
  Warnings:

  - Added the required column `montoTotal` to the `ProductoAnalisis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductoAnalisis" ADD COLUMN     "montoTotal" DOUBLE PRECISION NOT NULL;
