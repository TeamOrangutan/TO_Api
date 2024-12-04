/*
  Warnings:

  - Added the required column `subToal` to the `FAC_PRODUCTO` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FACTURA" DROP CONSTRAINT "FACTURA_formaPago_fk_fkey";

-- AlterTable
ALTER TABLE "FACTURA" ALTER COLUMN "formaPago_fk" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FAC_PRODUCTO" ADD COLUMN     "subToal" DECIMAL(65,30) NOT NULL;

-- AddForeignKey
ALTER TABLE "FACTURA" ADD CONSTRAINT "FACTURA_formaPago_fk_fkey" FOREIGN KEY ("formaPago_fk") REFERENCES "FORMA_PAGO"("forma_pk") ON DELETE SET NULL ON UPDATE CASCADE;
