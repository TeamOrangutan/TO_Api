-- DropForeignKey
ALTER TABLE "FACTURA" DROP CONSTRAINT "FACTURA_formaPago_fk_fkey";

-- AlterTable
ALTER TABLE "FACTURA" ALTER COLUMN "formaPago_fk" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TALLA" (
    "talla_pk" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "producto_fk" INTEGER NOT NULL,

    CONSTRAINT "TALLA_pkey" PRIMARY KEY ("talla_pk")
);

-- AddForeignKey
ALTER TABLE "FACTURA" ADD CONSTRAINT "FACTURA_formaPago_fk_fkey" FOREIGN KEY ("formaPago_fk") REFERENCES "FORMA_PAGO"("forma_pk") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TALLA" ADD CONSTRAINT "TALLA_producto_fk_fkey" FOREIGN KEY ("producto_fk") REFERENCES "PRODUCTOS"("producto_pk") ON DELETE RESTRICT ON UPDATE CASCADE;
