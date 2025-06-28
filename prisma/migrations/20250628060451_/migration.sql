/*
  Warnings:

  - You are about to drop the `_CategoryToProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TagToVariant` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sizeValue]` on the table `Size` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `VariantDetail` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_CategoryToProduct" DROP CONSTRAINT "_CategoryToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToProduct" DROP CONSTRAINT "_CategoryToProduct_B_fkey";

-- DropForeignKey
ALTER TABLE "_TagToVariant" DROP CONSTRAINT "_TagToVariant_A_fkey";

-- DropForeignKey
ALTER TABLE "_TagToVariant" DROP CONSTRAINT "_TagToVariant_B_fkey";

-- DropTable
DROP TABLE "_CategoryToProduct";

-- DropTable
DROP TABLE "_TagToVariant";

-- CreateTable
CREATE TABLE "ProductCategory" (
    "productId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("productId","categoryId")
);

-- CreateTable
CREATE TABLE "VariantTag" (
    "tagId" UUID NOT NULL,
    "variantId" UUID NOT NULL,

    CONSTRAINT "VariantTag_pkey" PRIMARY KEY ("tagId","variantId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Size_sizeValue_key" ON "Size"("sizeValue");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VariantDetail_title_key" ON "VariantDetail"("title");

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("categoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantTag" ADD CONSTRAINT "VariantTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("tagId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantTag" ADD CONSTRAINT "VariantTag_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("variantId") ON DELETE RESTRICT ON UPDATE CASCADE;
