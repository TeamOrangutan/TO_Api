/*
  Warnings:

  - You are about to drop the column `imagen` on the `PRODUCTOS` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PRODUCTOS" DROP COLUMN "imagen";

-- CreateTable
CREATE TABLE "IMAGEN" (
    "imagen_pk" SERIAL NOT NULL,
    "producto_fk" INTEGER NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "IMAGEN_pkey" PRIMARY KEY ("imagen_pk")
);

-- AddForeignKey
ALTER TABLE "IMAGEN" ADD CONSTRAINT "IMAGEN_producto_fk_fkey" FOREIGN KEY ("producto_fk") REFERENCES "PRODUCTOS"("producto_pk") ON DELETE RESTRICT ON UPDATE CASCADE;
