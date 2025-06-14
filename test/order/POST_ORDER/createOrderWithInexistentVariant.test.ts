import { ordersPathUrl } from "../shared";
import { expect, test } from "vitest";
import { api } from "../../api";
import { createSizeIfNotExists, createTestProduct } from "../../helper.js";
import { randomUUID } from "node:crypto";
import { UserOrderToSend } from "../orderToSend.js";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus.js";

test("create order with inexistent variant", async () => {
  const sizeValue = 37;
  const initialStock = 10;
  const quantityToBuy = 2;

  await createSizeIfNotExists(sizeValue);

  const newProduct = await createTestProduct({
    variants: [{ sizes: [{ sizeValue, stock: initialStock }] }],
  });

  const orderToSend = new UserOrderToSend({
    orderProducts: [
      {
        productId: newProduct.productId,
        productVariants: [
          {
            variantId: randomUUID(),
            variantSizes: [{ quantity: quantityToBuy, sizeValue }],
          },
        ],
      },
    ],
  }).toPrimitives();

  const createOrderResponse = await api.post(ordersPathUrl).send(orderToSend);
  expect(createOrderResponse.status).toBe(HTTP_STATUS.BAD_REQUEST);
});
