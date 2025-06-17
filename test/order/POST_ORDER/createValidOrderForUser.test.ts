import {
  compareTestOrder,
  ordersPathUrl,
  validateProductStockAfterPurchase,
} from "../shared.js";
import { expect, test } from "vitest";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus.js";
import { api } from "../../api.js";
import { createSizeIfNotExists, createTestProduct } from "../../helper.js";
import { OrderStatusOptions } from "../../../src/modules/order/domain/orderStatus.js";
import { OrderPaymentStatusOptions } from "../../../src/modules/order/domain/orderPaymentStatus.js";
import { UserOrderToSend } from "../orderToSend.js";

test("create valid order for user", async () => {
  const sizeValue = 37;
  const initialStock = 10;
  const quantityToBuy = 2;

  await createSizeIfNotExists(sizeValue);

  const newProduct = await createTestProduct({
    variants: [{ sizes: [{ sizeValue, stock: initialStock }] }],
  });

  const variant = newProduct.variants[0];
  
  const orderToSend = new UserOrderToSend({
    orderProducts: [
      {
        productId: newProduct.productId,
        productVariants: [
          {
            variantId: variant.variantId,
            variantSizes: [{ quantity: quantityToBuy, sizeValue }],
          },
        ],
      },
    ],
  }).toPrimitives();

  const createOrderResponse = await api.post(ordersPathUrl).send(orderToSend);
  expect(createOrderResponse.status).toBe(HTTP_STATUS.CREATED);
  expect(createOrderResponse.body.order).toMatchObject({
    orderId: expect.any(String),
  });

  await validateProductStockAfterPurchase({
    productId: newProduct.productId,
    variantId: variant.variantId,
    sizeValue,
    initialStock,
    quantityToBuy,
  });

  await compareTestOrder({
    orderId: createOrderResponse.body.order.orderId,
    status: OrderStatusOptions.WAITING_FOR_PAYMENT,
    paymentInfo: {
      paymentAt: null,
      paymentStatus: OrderPaymentStatusOptions.IN_PAYMENT_GATEWAY,
    },
    customer: {
      firstName: orderToSend.customer.firstName,
      lastName: orderToSend.customer.lastName,
      email: orderToSend.customer.email,
      phone: orderToSend.customer.phone,
    },
    shippingAddress: {
      region: orderToSend.shippingAddress.region,
      commune: orderToSend.shippingAddress.commune,
      streetName: orderToSend.shippingAddress.streetName,
      streetNumber: orderToSend.shippingAddress.streetNumber,
      additionalInfo: orderToSend.shippingAddress.additionalInfo,
    },
    orderProducts: [
      {
        productId: newProduct.productId,
        variants: [
          {
            variantId: variant.variantId,
            sizes: [{ sizeValue, quantity: quantityToBuy }],
          },
        ],
      },
    ],
  });
});
