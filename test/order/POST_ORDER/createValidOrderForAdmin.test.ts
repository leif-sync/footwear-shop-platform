import {
  compareTestOrder,
  ordersPathUrl,
  validateProductStockAfterPurchase,
} from "../shared";
import { expect, test } from "vitest";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import { api } from "../../api";
import {
  createSizeIfNotExists,
  createTestProduct,
  loginTest,
} from "../../helper.js";
import { orderStatusOptions } from "../../../src/modules/order/domain/orderStatus.js";
import { orderPaymentStatusOptions } from "../../../src/modules/order/domain/orderPaymentStatus.js";
import { AdminOrderToSend } from "../orderToSend.js";

test("create valid order for admin", async () => {
  const sizeValue = 37;
  const initialStock = 10;
  const quantityToBuy = 2;
  const token = await loginTest();

  await createSizeIfNotExists(sizeValue);

  const newProduct = await createTestProduct({
    variants: [{ sizes: [{ sizeValue, stock: initialStock }] }],
  });

  const variant = newProduct.variants[0];

  const orderToSend = new AdminOrderToSend({
    orderStatus: orderStatusOptions.WAITING_FOR_PAYMENT,
    paymentInfo: {
      paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
      paymentAt: null,
      paymentStatus: orderPaymentStatusOptions.PENDING,
    },
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

  const createOrderResponse = await api
    .post(ordersPathUrl)
    .send(orderToSend)
    .set("Cookie", token);

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
    status: orderToSend.orderStatus,
    paymentInfo: {
      paymentAt: orderToSend.paymentInfo.paymentAt,
      paymentStatus: orderToSend.paymentInfo.paymentStatus,
      paymentDeadline: orderToSend.paymentInfo.paymentDeadline,
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
