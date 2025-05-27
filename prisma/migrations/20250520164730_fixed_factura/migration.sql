/*
  Warnings:

  - You are about to drop the `FACTURA` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FAC_PRODUCTO` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FORMA_PAGO` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FPago_CLIENTE` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SERVICIO_BANCARIO` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FACTURA" DROP CONSTRAINT "FACTURA_formaPago_fk_fkey";

-- DropForeignKey
ALTER TABLE "FAC_PRODUCTO" DROP CONSTRAINT "FAC_PRODUCTO_factura_fk_fkey";

-- DropForeignKey
ALTER TABLE "FAC_PRODUCTO" DROP CONSTRAINT "FAC_PRODUCTO_producto_fk_fkey";

-- DropForeignKey
ALTER TABLE "FORMA_PAGO" DROP CONSTRAINT "FORMA_PAGO_servicio_fk_fkey";

-- DropForeignKey
ALTER TABLE "FPago_CLIENTE" DROP CONSTRAINT "FPago_CLIENTE_cliente_fk_fkey";

-- DropForeignKey
ALTER TABLE "FPago_CLIENTE" DROP CONSTRAINT "FPago_CLIENTE_forma_fk_fkey";

-- DropTable
DROP TABLE "FACTURA";

-- DropTable
DROP TABLE "FAC_PRODUCTO";

-- DropTable
DROP TABLE "FORMA_PAGO";

-- DropTable
DROP TABLE "FPago_CLIENTE";

-- DropTable
DROP TABLE "SERVICIO_BANCARIO";

-- CreateTable
CREATE TABLE "Factura" (
    "factura_pk" SERIAL NOT NULL,
    "orden_id" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombreCliente" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "folio" TEXT NOT NULL,

    CONSTRAINT "Factura_pkey" PRIMARY KEY ("factura_pk")
);

-- CreateTable
CREATE TABLE "FacturaItem" (
    "factura_item_pk" SERIAL NOT NULL,
    "factura_id" INTEGER NOT NULL,
    "orden_item_id" INTEGER NOT NULL,

    CONSTRAINT "FacturaItem_pkey" PRIMARY KEY ("factura_item_pk")
);

-- CreateIndex
CREATE UNIQUE INDEX "Factura_orden_id_key" ON "Factura"("orden_id");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_folio_key" ON "Factura"("folio");

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ORDENES"("orden_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturaItem" ADD CONSTRAINT "FacturaItem_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "Factura"("factura_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacturaItem" ADD CONSTRAINT "FacturaItem_orden_item_id_fkey" FOREIGN KEY ("orden_item_id") REFERENCES "ORDEN_ITEM"("orden_item_pk") ON DELETE RESTRICT ON UPDATE CASCADE;
