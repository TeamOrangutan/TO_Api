-- CreateTable
CREATE TABLE "REPORTE_QUINCENAL" (
    "reporte_pk" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "fecha_generacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "desde" TIMESTAMP(3) NOT NULL,
    "hasta" TIMESTAMP(3) NOT NULL,
    "usuario_fk" INTEGER,
    "totalVentas" DOUBLE PRECISION NOT NULL,
    "productosVendidos" INTEGER NOT NULL,
    "ordenesProcesadas" INTEGER NOT NULL,
    "promedioDiario" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "REPORTE_QUINCENAL_pkey" PRIMARY KEY ("reporte_pk")
);

-- CreateTable
CREATE TABLE "VentaDiaria" (
    "ventaDiaria_pk" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "totalVentas" DOUBLE PRECISION NOT NULL,
    "reporte_fk" INTEGER NOT NULL,

    CONSTRAINT "VentaDiaria_pkey" PRIMARY KEY ("ventaDiaria_pk")
);

-- CreateTable
CREATE TABLE "ProductoAnalisis" (
    "productoAnalisis_pk" SERIAL NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "cantidadVendida" INTEGER NOT NULL,
    "reporte_fk" INTEGER NOT NULL,

    CONSTRAINT "ProductoAnalisis_pkey" PRIMARY KEY ("productoAnalisis_pk")
);

-- CreateIndex
CREATE UNIQUE INDEX "REPORTE_QUINCENAL_codigo_key" ON "REPORTE_QUINCENAL"("codigo");

-- AddForeignKey
ALTER TABLE "REPORTE_QUINCENAL" ADD CONSTRAINT "REPORTE_QUINCENAL_usuario_fk_fkey" FOREIGN KEY ("usuario_fk") REFERENCES "USUARIO"("usuario_pk") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaDiaria" ADD CONSTRAINT "VentaDiaria_reporte_fk_fkey" FOREIGN KEY ("reporte_fk") REFERENCES "REPORTE_QUINCENAL"("reporte_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoAnalisis" ADD CONSTRAINT "ProductoAnalisis_reporte_fk_fkey" FOREIGN KEY ("reporte_fk") REFERENCES "REPORTE_QUINCENAL"("reporte_pk") ON DELETE RESTRICT ON UPDATE CASCADE;
