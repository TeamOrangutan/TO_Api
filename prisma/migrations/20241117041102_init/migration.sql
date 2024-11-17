-- CreateTable
CREATE TABLE "Descripcion" (
    "descripcion_pk" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "producto_fk" INTEGER NOT NULL,

    CONSTRAINT "Descripcion_pkey" PRIMARY KEY ("descripcion_pk")
);

-- CreateTable
CREATE TABLE "Imagen" (
    "imagen_pk" SERIAL NOT NULL,
    "imagen_url" TEXT NOT NULL,
    "producto_fk" INTEGER NOT NULL,

    CONSTRAINT "Imagen_pkey" PRIMARY KEY ("imagen_pk")
);

-- CreateTable
CREATE TABLE "Inventario" (
    "inventario_pk" SERIAL NOT NULL,
    "producto_fk" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,

    CONSTRAINT "Inventario_pkey" PRIMARY KEY ("inventario_pk")
);

-- CreateTable
CREATE TABLE "Producto" (
    "producto_pk" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" BOOLEAN NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("producto_pk")
);

-- CreateTable
CREATE TABLE "Registro" (
    "registro_pk" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "producto_fk" INTEGER NOT NULL,
    "usuario_fk" INTEGER NOT NULL,

    CONSTRAINT "Registro_pkey" PRIMARY KEY ("registro_pk")
);

-- CreateTable
CREATE TABLE "Rol" (
    "rol_pk" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("rol_pk")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "user_pk" SERIAL NOT NULL,
    "contrasena" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol_fk" INTEGER NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("user_pk")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- AddForeignKey
ALTER TABLE "Descripcion" ADD CONSTRAINT "Descripcion_producto_fk_fkey" FOREIGN KEY ("producto_fk") REFERENCES "Producto"("producto_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imagen" ADD CONSTRAINT "Imagen_producto_fk_fkey" FOREIGN KEY ("producto_fk") REFERENCES "Producto"("producto_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventario" ADD CONSTRAINT "Inventario_producto_fk_fkey" FOREIGN KEY ("producto_fk") REFERENCES "Producto"("producto_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registro" ADD CONSTRAINT "Registro_producto_fk_fkey" FOREIGN KEY ("producto_fk") REFERENCES "Producto"("producto_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registro" ADD CONSTRAINT "Registro_usuario_fk_fkey" FOREIGN KEY ("usuario_fk") REFERENCES "Usuario"("user_pk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_rol_fk_fkey" FOREIGN KEY ("rol_fk") REFERENCES "Rol"("rol_pk") ON DELETE RESTRICT ON UPDATE CASCADE;
