-- CreateTable
CREATE TABLE "ORDENES" (
    "orden_pk" SERIAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "usuario_fk" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "payerEmail" TEXT,
    "payerName" TEXT,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "moneda" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ORDENES_pkey" PRIMARY KEY ("orden_pk")
);

-- CreateIndex
CREATE UNIQUE INDEX "ORDENES_orderId_key" ON "ORDENES"("orderId");

-- AddForeignKey
ALTER TABLE "ORDENES" ADD CONSTRAINT "ORDENES_usuario_fk_fkey" FOREIGN KEY ("usuario_fk") REFERENCES "USUARIO"("usuario_pk") ON DELETE RESTRICT ON UPDATE CASCADE;
