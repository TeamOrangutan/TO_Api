/*
  Warnings:

  - You are about to drop the column `imagenPerfil` on the `USUARIO` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PERSONA" ADD COLUMN     "imagenPerfil" TEXT;

-- AlterTable
ALTER TABLE "USUARIO" DROP COLUMN "imagenPerfil";
