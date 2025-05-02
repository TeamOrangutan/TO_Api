/*
  Warnings:

  - You are about to drop the `CARRITO` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CARRITO_ITEM` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `subTotal` to the `FAC_PRODUCTO` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CARRITO" DROP CONSTRAINT "CARRITO_usuario_fk_fkey";

-- DropForeignKey
ALTER TABLE "CARRITO_ITEM" DROP CONSTRAINT "CARRITO_ITEM_carrito_fk_fkey";

-- DropForeignKey
ALTER TABLE "CARRITO_ITEM" DROP CONSTRAINT "CARRITO_ITEM_producto_fk_fkey";

-- AlterTable
ALTER TABLE "FAC_PRODUCTO" ADD COLUMN     "subTotal" DECIMAL(65,30) NOT NULL;

-- DropTable
DROP TABLE "CARRITO";

-- DropTable
DROP TABLE "CARRITO_ITEM";
