import { ordersPathUrl } from "../shared";
import { expect, test } from "vitest";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import { api } from "../../api";
import { createSizeIfNotExists, createTestProduct } from "../../helper.js";
import { OrderStatusOptions } from "../../../src/modules/order/domain/orderStatus.js";
import { OrderPaymentStatusOptions } from "../../../src/modules/order/domain/orderPaymentStatus.js";
import { AdminOrderToSend } from "../orderToSend.js";

test("create order for admin without auth", async () => {
  const sizeValue = 37;
  const newStock = 10;
  const quantityToBuy = 2;

  await createSizeIfNotExists(sizeValue);

  const newProduct = await createTestProduct({
    variants: [{ sizes: [{ sizeValue, stock: newStock }] }],
  });

  const variant = newProduct.variants[0];

  const orderToSend = new AdminOrderToSend({
    orderStatus: OrderStatusOptions.WAITING_FOR_SHIPMENT,
    paymentInfo: {
      paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
      paymentAt: null,
      paymentStatus: OrderPaymentStatusOptions.PENDING,
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

  const createOrderResponse = await api.post(ordersPathUrl).send(orderToSend);

  expect(createOrderResponse.status).toBe(HTTP_STATUS.BAD_REQUEST);
});
