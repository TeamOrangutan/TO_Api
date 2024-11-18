/*
  Warnings:

  - You are about to drop the column `administrador_fk` on the `REGISTRO` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "REGISTRO" DROP CONSTRAINT "REGISTRO_administrador_fk_fkey";

-- AlterTable
ALTER TABLE "REGISTRO" DROP COLUMN "administrador_fk";
