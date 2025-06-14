import { expect } from "vitest";
import { ServiceContainer } from "../../src/modules/shared/infrastructure/serviceContainer";
import { basePath } from "../api";

export const ordersPathUrl = `${basePath}/orders`;

export function returnIfNotUndefined(a: any, b: any) {
  return a ?? a === null ? a : b;
}

export async function compareTestOrder(params: {
  orderId: string;
  status?: string;
  paymentInfo?: {
    paymentDeadline?: Date;
    paymentAt?: Date | null;
    paymentStatus?: string;
  };
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  shippingAddress?: {
    region?: string;
    commune?: string;
    streetName?: string;
    streetNumber?: string;
    additionalInfo?: string | null;
  };
  orderProducts?: {
    productId: string;
    variants: {
      variantId: string;
      sizes: {
        sizeValue: number;
        quantity: number;
      }[];
    }[];
  }[];
}) {
  const { orderId } = params;
  const orderFound = await ServiceContainer.order.getOrder.run({ orderId });

  const orderToCompare = {
    status: params.status ?? expect.any(String),
    paymentInfo: {
      paymentDeadline: params.paymentInfo?.paymentDeadline ?? expect.any(Date),
      paymentAt: returnIfNotUndefined(
        params.paymentInfo?.paymentAt,
        expect.toBeOneOf([null, expect.any(Date)])
      ),
      paymentStatus: params.paymentInfo?.paymentStatus ?? expect.any(String),
    },
    customer: {
      firstName: params.customer?.firstName ?? expect.any(String),
      lastName: params.customer?.lastName ?? expect.any(String),
      email: params.customer?.email ?? expect.any(String),
      phone: params.customer?.phone ?? expect.any(String),
    },
    shippingAddress: {
      region: params.shippingAddress?.region ?? expect.any(String),
      commune: params.shippingAddress?.commune ?? expect.any(String),
      streetName: params.shippingAddress?.streetName ?? expect.any(String),
      streetNumber: params.shippingAddress?.streetNumber ?? expect.any(String),
      additionalInfo: returnIfNotUndefined(
        params.shippingAddress?.additionalInfo,
        expect.toBeOneOf([null, expect.any(String)])
      ),
    },
    products: expect.any(Array),
  };

  expect(orderFound).toMatchObject(orderToCompare);

  if (params.orderProducts) {
    params.orderProducts.forEach((orderProduct) => {
      const productFound = orderFound.products.find(
        (product) => product.productId === orderProduct.productId
      );

      if (!productFound) throw new Error("Product not found in order");

      orderProduct.variants.forEach((orderVariant) => {
        const variantFound = productFound.productVariants.find(
          (v) => v.variantId === orderVariant.variantId
        );

        if (!variantFound) throw new Error("Variant not found in order");

        orderVariant.sizes.forEach((size) => {
          const sizeFound = variantFound.variantSizes.find(
            (s) => s.sizeValue === size.sizeValue
          );

          if (!sizeFound) throw new Error("Size not found in order");

          expect(sizeFound.quantity).toBe(size.quantity);
        });
      });
    });
  }
}

export async function validateProductStockAfterPurchase(params: {
  productId: string;
  variantId: string;
  sizeValue: number;
  initialStock: number;
  quantityToBuy: number;
}) {
  const productFound = await ServiceContainer.product.getProduct.run({
    productId: params.productId,
  });

  const variantFound = productFound.variants.find(
    (variant) => variant.variantId === params.variantId
  );

  if (!variantFound) throw new Error("Variant not found");

  const sizeFound = variantFound.sizes.find(
    (size) => size.sizeValue === params.sizeValue
  );
  if (!sizeFound) throw new Error("Size not found");

  expect(sizeFound.stock).toBe(params.initialStock - params.quantityToBuy);
}
