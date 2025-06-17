import { api } from "../../api.ts";
import { expect, test } from "vitest";
import { createTestOrder, loginTest } from "../../helper.ts";
import { ordersPathUrl } from "../shared.ts";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus.ts";
import { OrderStatusOptions } from "../../../src/modules/order/domain/orderStatus.ts";
import { OrderPaymentStatusOptions } from "../../../src/modules/order/domain/orderPaymentStatus.ts";

test("list orders by customer email", async () => {
  const customerEmail = "test.customer.email@example.com";
  await createTestOrder({
    customer: {
      email: customerEmail,
    },
    paymentInfo: {
      paymentAt: new Date(),
      paymentStatus: OrderPaymentStatusOptions.PAID,
      paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
    },
  });

  const token = await loginTest();
  const limit = 10;
  const offset = 0;
  const response = await api
    .get(ordersPathUrl)
    .query({
      limit,
      offset,
      customerEmail,
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
      customerEmail: customerEmail,
      totalAmount: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      paymentStatus: expect.toBeOneOf(Object.values(OrderPaymentStatusOptions)),
    });

    expect(order.paymentStatus).not.toBe(
      OrderPaymentStatusOptions.IN_PAYMENT_GATEWAY
    );
  });

  expect(response.body.meta).toMatchObject({
    limit,
    offset,
    currentOrdersCount: response.body.orders.length,
    storedOrdersCount: expect.any(Number),
  });
});
