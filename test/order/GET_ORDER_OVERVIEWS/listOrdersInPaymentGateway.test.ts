import { api } from "../../api.ts";
import { expect, test } from "vitest";
import { createTestOrder, loginTest } from "../../helper.ts";
import { ordersPathUrl } from "../shared.ts";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus.ts";
import { OrderStatusOptions } from "../../../src/modules/order/domain/orderStatus.ts";
import { OrderPaymentStatusOptions } from "../../../src/modules/order/domain/orderPaymentStatus.ts";

test("list orders that are not in the payment gateway", async () => {
  for (let i = 0; i < 20; i++) {
    await createTestOrder({
      orderStatus: OrderStatusOptions.WAITING_FOR_PAYMENT,
      paymentInfo: {
        paymentAt: null,
        paymentStatus: OrderPaymentStatusOptions.IN_PAYMENT_GATEWAY,
        paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
  }

  const token = await loginTest();
  const limit = 10;
  const offset = 0;

  const response = await api
    .get(ordersPathUrl)
    .query({
      limit,
      offset,
      showOrdersInPaymentProcess: true,
    })
    .set("Cookie", token);

  expect(response.status).toBe(HTTP_STATUS.OK);
  expect(response.body.orders).toBeDefined();
  expect(response.body.orders).toBeInstanceOf(Array);
  expect(response.body.orders.length).toBeGreaterThanOrEqual(1);
  expect(response.body.orders.length).toBeLessThanOrEqual(limit);

  response.body.orders.forEach((order) => {
    expect(order).toMatchObject({
      orderId: expect.any(String),
      orderStatus: expect.toBeOneOf(Object.values(OrderStatusOptions)),
      customerEmail: expect.any(String),
      totalAmount: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      paymentStatus: expect.toBeOneOf(Object.values(OrderPaymentStatusOptions)),
    });
  });

  expect(response.body.meta).toMatchObject({
    limit,
    offset,
    currentOrdersCount: response.body.orders.length,
    storedOrdersCount: expect.any(Number),
  });
});
