import { ordersPathUrl } from "../shared";
import { expect, test } from "vitest";
import { api } from "../../api";
import { createSizeIfNotExists } from "../../helper.js";
import { randomUUID } from "node:crypto";
import { UserOrderToSend } from "../orderToSend.js";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus.js";

test("create order with inexistent product", async () => {
  const sizeValue = 37;
  const quantityToBuy = 2;

  await createSizeIfNotExists(sizeValue);

  const orderToSend = new UserOrderToSend({
    orderProducts: [
      {
        productId: randomUUID(),
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
