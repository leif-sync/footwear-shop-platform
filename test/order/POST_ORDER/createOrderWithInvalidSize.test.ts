import { ordersPathUrl } from "../shared.js";
import { expect, test } from "vitest";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus.js";
import { api } from "../../api.js";
import { UserOrderToSend } from "../orderToSend.js";
import { createTestProduct } from "../../helper.js";

test("create order with invalid size", async () => {
  const sizeValue = 37;
  const initialStock = 10;
  const quantityToBuy = 2;
  const sizeToBuy = 20;

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
            variantSizes: [{ quantity: quantityToBuy, sizeValue: sizeToBuy }],
          },
        ],
      },
    ],
  }).toPrimitives();

  const createOrderResponse = await api.post(ordersPathUrl).send(orderToSend);
  expect(createOrderResponse.status).toBe(HTTP_STATUS.BAD_REQUEST);
});
