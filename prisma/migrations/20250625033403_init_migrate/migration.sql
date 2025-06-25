-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('WAITING_FOR_PAYMENT', 'WAITING_FOR_SHIPMENT', 'SHIPPED', 'CANCELED', 'DELIVERED', 'RETURNED');

-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('IN_PAYMENT_GATEWAY', 'PENDING', 'PAID', 'EXPIRED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "OrderCreatorType" AS ENUM ('GUEST', 'ADMIN');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PAYMENT', 'REFUND');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('APPROVED', 'DECLINED', 'CANCELED', 'PENDING');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('CLP');

-- CreateEnum
CREATE TYPE "PaymentProcessor" AS ENUM ('WEBPAY');

-- CreateEnum
CREATE TYPE "PriceDiscountType" AS ENUM ('PERCENT', 'FIXED', 'NONE');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('HIDDEN', 'VISIBLE');

-- CreateTable
CREATE TABLE "VariantDetail" (
    "variantDetailId" UUID NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "VariantDetail_pkey" PRIMARY KEY ("variantDetailId")
);

-- CreateTable
CREATE TABLE "Admin" (
    "adminId" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("adminId")
);

-- CreateTable
CREATE TABLE "Permissions" (
    "permissionId" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Permissions_pkey" PRIMARY KEY ("permissionId")
);

-- CreateTable
CREATE TABLE "AdminRefreshToken" (
    "tokenId" UUID NOT NULL,
    "adminId" UUID NOT NULL,

    CONSTRAINT "AdminRefreshToken_pkey" PRIMARY KEY ("tokenId")
);

-- CreateTable
CREATE TABLE "LoginCode" (
    "loginCodeId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "expiresInSeconds" INTEGER NOT NULL,
    "notificationEmail" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL,

    CONSTRAINT "LoginCode_pkey" PRIMARY KEY ("loginCodeId")
);

-- CreateTable
CREATE TABLE "Category" (
    "categoryId" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("categoryId")
);

-- CreateTable
CREATE TABLE "Order" (
    "orderId" UUID NOT NULL,
    "orderStatus" "OrderStatus" NOT NULL,
    "customerFirstName" TEXT NOT NULL,
    "customerLastName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "shippingAddressRegion" TEXT NOT NULL,
    "shippingAddressCommune" TEXT NOT NULL,
    "shippingAddressStreetName" TEXT NOT NULL,
    "shippingAddressStreetNumber" TEXT NOT NULL,
    "shippingAddressAdditionalInfo" TEXT,
    "paymentStatus" "OrderPaymentStatus" NOT NULL,
    "paymentDeadline" TIMESTAMPTZ NOT NULL,
    "paymentAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "creatorType" "OrderCreatorType" NOT NULL,
    "creatorId" UUID,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "OrderProduct" (
    "orderProductId" UUID NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "productId" UUID NOT NULL,
    "orderId" UUID NOT NULL,

    CONSTRAINT "OrderProduct_pkey" PRIMARY KEY ("orderProductId")
);

-- CreateTable
CREATE TABLE "OrderVariant" (
    "orderVariantId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "orderProductId" UUID NOT NULL,
    "variantSizeId" UUID NOT NULL,

    CONSTRAINT "OrderVariant_pkey" PRIMARY KEY ("orderVariantId")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "transactionId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "transactionStatus" "TransactionStatus" NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentProcessor" "PaymentProcessor" NOT NULL,
    "rawResponse" JSONB NOT NULL,
    "currency" "Currency" NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "gatewaySessionId" TEXT,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("transactionId")
);

-- CreateTable
CREATE TABLE "Product" (
    "productId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceBaseValue" INTEGER NOT NULL,
    "priceDiscountType" "PriceDiscountType" NOT NULL,
    "priceDiscountValue" INTEGER NOT NULL,
    "priceDiscountStartAt" TIMESTAMPTZ,
    "priceDiscountEndAt" TIMESTAMPTZ,
    "visibility" "Visibility" NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "VariantDetailContent" (
    "content" TEXT NOT NULL,
    "detailId" UUID NOT NULL,
    "variantId" UUID NOT NULL,

    CONSTRAINT "VariantDetailContent_pkey" PRIMARY KEY ("detailId","variantId")
);

-- CreateTable
CREATE TABLE "VariantSize" (
    "variantSizeId" UUID NOT NULL,
    "stock" INTEGER NOT NULL,
    "sizeId" UUID NOT NULL,
    "variantId" UUID NOT NULL,

    CONSTRAINT "VariantSize_pkey" PRIMARY KEY ("variantSizeId")
);

-- CreateTable
CREATE TABLE "Variant" (
    "variantId" UUID NOT NULL,
    "hexColor" TEXT NOT NULL,
    "images" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "visibility" "Visibility" NOT NULL,
    "productId" UUID NOT NULL,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("variantId")
);

-- CreateTable
CREATE TABLE "Size" (
    "sizeId" UUID NOT NULL,
    "sizeValue" INTEGER NOT NULL,

    CONSTRAINT "Size_pkey" PRIMARY KEY ("sizeId")
);

-- CreateTable
CREATE TABLE "Tag" (
    "tagId" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("tagId")
);

-- CreateTable
CREATE TABLE "_AdminToPermissions" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_AdminToPermissions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CategoryToProduct" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CategoryToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TagToVariant" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_TagToVariant_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Permissions_name_key" ON "Permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AdminRefreshToken_adminId_key" ON "AdminRefreshToken"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderProduct_orderId_productId_key" ON "OrderProduct"("orderId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderVariant_orderProductId_variantSizeId_key" ON "OrderVariant"("orderProductId", "variantSizeId");

-- CreateIndex
CREATE UNIQUE INDEX "VariantSize_sizeId_variantId_key" ON "VariantSize"("sizeId", "variantId");

-- CreateIndex
CREATE INDEX "_AdminToPermissions_B_index" ON "_AdminToPermissions"("B");

-- CreateIndex
CREATE INDEX "_CategoryToProduct_B_index" ON "_CategoryToProduct"("B");

-- CreateIndex
CREATE INDEX "_TagToVariant_B_index" ON "_TagToVariant"("B");

-- AddForeignKey
ALTER TABLE "OrderProduct" ADD CONSTRAINT "OrderProduct_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProduct" ADD CONSTRAINT "OrderProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderVariant" ADD CONSTRAINT "OrderVariant_variantSizeId_fkey" FOREIGN KEY ("variantSizeId") REFERENCES "VariantSize"("variantSizeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderVariant" ADD CONSTRAINT "OrderVariant_orderProductId_fkey" FOREIGN KEY ("orderProductId") REFERENCES "OrderProduct"("orderProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantDetailContent" ADD CONSTRAINT "VariantDetailContent_detailId_fkey" FOREIGN KEY ("detailId") REFERENCES "VariantDetail"("variantDetailId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantDetailContent" ADD CONSTRAINT "VariantDetailContent_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("variantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantSize" ADD CONSTRAINT "VariantSize_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("variantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantSize" ADD CONSTRAINT "VariantSize_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("sizeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToPermissions" ADD CONSTRAINT "_AdminToPermissions_A_fkey" FOREIGN KEY ("A") REFERENCES "Admin"("adminId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToPermissions" ADD CONSTRAINT "_AdminToPermissions_B_fkey" FOREIGN KEY ("B") REFERENCES "Permissions"("permissionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("categoryId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("productId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToVariant" ADD CONSTRAINT "_TagToVariant_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("tagId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToVariant" ADD CONSTRAINT "_TagToVariant_B_fkey" FOREIGN KEY ("B") REFERENCES "Variant"("variantId") ON DELETE CASCADE ON UPDATE CASCADE;
