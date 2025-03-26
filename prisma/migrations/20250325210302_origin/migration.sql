-- CreateTable
CREATE TABLE "CARRITO" (
    "carrito_pk" SERIAL NOT NULL,
    "usuario_fk" INTEGER NOT NULL,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "CARRITO_pkey" PRIMARY KEY ("carrito_pk")
);

-- CreateTable
CREATE TABLE "CARRITO_ITEM" (
    "carritoItem_pk" SERIAL NOT NULL,
    "carrito_fk" INTEGER NOT NULL,
    "producto_fk" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "CARRITO_ITEM_pkey" PRIMARY KEY ("carritoItem_pk")
);

-- CreateIndex
CREATE UNIQUE INDEX "CARRITO_usuario_fk_key" ON "CARRITO"("usuario_fk");

-- AddForeignKey
ALTER TABLE "CARRITO" ADD CONSTRAINT "CARRITO_usuario_fk_fkey" FOREIGN KEY ("usuario_fk") REFERENCES "USUARIO"("usuario_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CARRITO_ITEM" ADD CONSTRAINT "CARRITO_ITEM_carrito_fk_fkey" FOREIGN KEY ("carrito_fk") REFERENCES "CARRITO"("carrito_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CARRITO_ITEM" ADD CONSTRAINT "CARRITO_ITEM_producto_fk_fkey" FOREIGN KEY ("producto_fk") REFERENCES "PRODUCTOS"("producto_pk") ON DELETE RESTRICT ON UPDATE CASCADE;
