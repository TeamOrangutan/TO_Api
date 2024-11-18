-- CreateTable
CREATE TABLE "ROL" (
    "rol_pk" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "ROL_pkey" PRIMARY KEY ("rol_pk")
);

-- CreateTable
CREATE TABLE "USUARIO" (
    "usuario_pk" SERIAL NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "rol_fk" INTEGER NOT NULL,

    CONSTRAINT "USUARIO_pkey" PRIMARY KEY ("usuario_pk")
);

-- CreateTable
CREATE TABLE "PERSONA" (
    "persona_pk" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "usuario_fk" INTEGER NOT NULL,

    CONSTRAINT "PERSONA_pkey" PRIMARY KEY ("persona_pk")
);

-- CreateTable
CREATE TABLE "SERVICIO_BANCARIO" (
    "servicio_pk" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "SERVICIO_BANCARIO_pkey" PRIMARY KEY ("servicio_pk")
);

-- CreateTable
CREATE TABLE "FORMA_PAGO" (
    "forma_pk" SERIAL NOT NULL,
    "numeroTarjeta" TEXT NOT NULL,
    "nombrePropietario" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "fechaExpiracion" TIMESTAMP(3) NOT NULL,
    "servicio_fk" INTEGER NOT NULL,

    CONSTRAINT "FORMA_PAGO_pkey" PRIMARY KEY ("forma_pk")
);

-- CreateTable
CREATE TABLE "FACTURA" (
    "factura_pk" SERIAL NOT NULL,
    "formaPago_fk" INTEGER NOT NULL,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "fecha" TIMESTAMP(3),

    CONSTRAINT "FACTURA_pkey" PRIMARY KEY ("factura_pk")
);

-- CreateTable
CREATE TABLE "FPago_CLIENTE" (
    "fpc_pk" SERIAL NOT NULL,
    "forma_fk" INTEGER NOT NULL,
    "cliente_fk" INTEGER NOT NULL,

    CONSTRAINT "FPago_CLIENTE_pkey" PRIMARY KEY ("fpc_pk")
);

-- CreateTable
CREATE TABLE "PRODUCTOS" (
    "producto_pk" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precioVenta" DECIMAL(65,30) NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "PRODUCTOS_pkey" PRIMARY KEY ("producto_pk")
);

-- CreateTable
CREATE TABLE "INVENTARIO" (
    "costes_pk" SERIAL NOT NULL,
    "precioCompra" DECIMAL(65,30) NOT NULL,
    "stock" INTEGER NOT NULL,
    "producto_fk" INTEGER NOT NULL,

    CONSTRAINT "INVENTARIO_pkey" PRIMARY KEY ("costes_pk")
);

-- CreateTable
CREATE TABLE "REGISTRO" (
    "registro_pk" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "administrador_fk" INTEGER NOT NULL,
    "producto_fk" INTEGER NOT NULL,

    CONSTRAINT "REGISTRO_pkey" PRIMARY KEY ("registro_pk")
);

-- CreateTable
CREATE TABLE "FAC_PRODUCTO" (
    "facProducto_pk" SERIAL NOT NULL,
    "factura_fk" INTEGER NOT NULL,
    "producto_fk" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "FAC_PRODUCTO_pkey" PRIMARY KEY ("facProducto_pk")
);

-- CreateTable
CREATE TABLE "MATERIAL" (
    "material_pk" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "MATERIAL_pkey" PRIMARY KEY ("material_pk")
);

-- CreateTable
CREATE TABLE "PRO_SERIGRAFIADO" (
    "serigrafiado_pk" SERIAL NOT NULL,
    "color" TEXT NOT NULL,
    "tamano" TEXT NOT NULL,
    "tipoTinta" TEXT NOT NULL,
    "tipoProducto" TEXT NOT NULL,
    "material_fk" INTEGER NOT NULL,
    "producto_fk" INTEGER NOT NULL,

    CONSTRAINT "PRO_SERIGRAFIADO_pkey" PRIMARY KEY ("serigrafiado_pk")
);

-- CreateTable
CREATE TABLE "PRO_POSTERS" (
    "poster_pk" SERIAL NOT NULL,
    "dimensiones" TEXT NOT NULL,
    "tipoImpresion" TEXT NOT NULL,
    "acabado" TEXT NOT NULL,
    "tipoPapel" TEXT NOT NULL,
    "calidadImpresion" TEXT NOT NULL,
    "producto_fk" INTEGER NOT NULL,

    CONSTRAINT "PRO_POSTERS_pkey" PRIMARY KEY ("poster_pk")
);

-- CreateTable
CREATE TABLE "PRO_IMPRESION" (
    "impresion_pk" SERIAL NOT NULL,
    "duracion" TEXT NOT NULL,
    "resolucion" TEXT NOT NULL,
    "nroFrames" TEXT NOT NULL,
    "formato" TEXT NOT NULL,
    "tipoAnimacion" TEXT NOT NULL,
    "producto_fk" INTEGER NOT NULL,

    CONSTRAINT "PRO_IMPRESION_pkey" PRIMARY KEY ("impresion_pk")
);

-- CreateIndex
CREATE UNIQUE INDEX "USUARIO_correo_key" ON "USUARIO"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "PERSONA_usuario_fk_key" ON "PERSONA"("usuario_fk");

-- AddForeignKey
ALTER TABLE "USUARIO" ADD CONSTRAINT "USUARIO_rol_fk_fkey" FOREIGN KEY ("rol_fk") REFERENCES "ROL"("rol_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PERSONA" ADD CONSTRAINT "PERSONA_usuario_fk_fkey" FOREIGN KEY ("usuario_fk") REFERENCES "USUARIO"("usuario_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FORMA_PAGO" ADD CONSTRAINT "FORMA_PAGO_servicio_fk_fkey" FOREIGN KEY ("servicio_fk") REFERENCES "SERVICIO_BANCARIO"("servicio_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FACTURA" ADD CONSTRAINT "FACTURA_formaPago_fk_fkey" FOREIGN KEY ("formaPago_fk") REFERENCES "FORMA_PAGO"("forma_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FPago_CLIENTE" ADD CONSTRAINT "FPago_CLIENTE_forma_fk_fkey" FOREIGN KEY ("forma_fk") REFERENCES "FORMA_PAGO"("forma_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FPago_CLIENTE" ADD CONSTRAINT "FPago_CLIENTE_cliente_fk_fkey" FOREIGN KEY ("cliente_fk") REFERENCES "PERSONA"("persona_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "INVENTARIO" ADD CONSTRAINT "INVENTARIO_producto_fk_fkey" FOREIGN KEY ("producto_fk") REFERENCES "PRODUCTOS"("producto_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "REGISTRO" ADD CONSTRAINT "REGISTRO_administrador_fk_fkey" FOREIGN KEY ("administrador_fk") REFERENCES "PERSONA"("persona_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "REGISTRO" ADD CONSTRAINT "REGISTRO_producto_fk_fkey" FOREIGN KEY ("producto_fk") REFERENCES "PRODUCTOS"("producto_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAC_PRODUCTO" ADD CONSTRAINT "FAC_PRODUCTO_factura_fk_fkey" FOREIGN KEY ("factura_fk") REFERENCES "FACTURA"("factura_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAC_PRODUCTO" ADD CONSTRAINT "FAC_PRODUCTO_producto_fk_fkey" FOREIGN KEY ("producto_fk") REFERENCES "PRODUCTOS"("producto_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PRO_SERIGRAFIADO" ADD CONSTRAINT "PRO_SERIGRAFIADO_material_fk_fkey" FOREIGN KEY ("material_fk") REFERENCES "MATERIAL"("material_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PRO_SERIGRAFIADO" ADD CONSTRAINT "PRO_SERIGRAFIADO_producto_fk_fkey" FOREIGN KEY ("producto_fk") REFERENCES "PRODUCTOS"("producto_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PRO_POSTERS" ADD CONSTRAINT "PRO_POSTERS_producto_fk_fkey" FOREIGN KEY ("producto_fk") REFERENCES "PRODUCTOS"("producto_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PRO_IMPRESION" ADD CONSTRAINT "PRO_IMPRESION_producto_fk_fkey" FOREIGN KEY ("producto_fk") REFERENCES "PRODUCTOS"("producto_pk") ON DELETE RESTRICT ON UPDATE CASCADE;
