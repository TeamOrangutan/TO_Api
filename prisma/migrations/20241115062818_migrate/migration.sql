-- CreateTable
CREATE TABLE "Product" (
    "product_pk" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category_fk" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("product_pk")
);

-- CreateTable
CREATE TABLE "Category" (
    "category_pk" SERIAL NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("category_pk")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_category_fk_fkey" FOREIGN KEY ("category_fk") REFERENCES "Category"("category_pk") ON DELETE RESTRICT ON UPDATE CASCADE;
