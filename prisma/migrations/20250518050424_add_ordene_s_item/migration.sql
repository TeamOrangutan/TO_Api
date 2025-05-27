/*
  Warnings:

  - You are about to drop the column `cantidad` on the `ORDENES` table. All the data in the column will be lost.
  - Added the required column `total` to the `ORDENES` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ORDENES" DROP COLUMN "cantidad",
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "ORDEN_ITEM" (
    "orden_item_pk" SERIAL NOT NULL,
    "orden_fk" INTEGER NOT NULL,
    "producto_fk" INTEGER NOT NULL,
    "talla_fk" INTEGER,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario_usd" DOUBLE PRECISION NOT NULL,
    "subtotal_usd" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ORDEN_ITEM_pkey" PRIMARY KEY ("orden_item_pk")
);

-- AddForeignKey
ALTER TABLE "ORDEN_ITEM" ADD CONSTRAINT "ORDEN_ITEM_orden_fk_fkey" FOREIGN KEY ("orden_fk") REFERENCES "ORDENES"("orden_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ORDEN_ITEM" ADD CONSTRAINT "ORDEN_ITEM_producto_fk_fkey" FOREIGN KEY ("producto_fk") REFERENCES "PRODUCTOS"("producto_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ORDEN_ITEM" ADD CONSTRAINT "ORDEN_ITEM_talla_fk_fkey" FOREIGN KEY ("talla_fk") REFERENCES "TALLA"("talla_pk") ON DELETE SET NULL ON UPDATE CASCADE;
