import { api } from "../../api.ts";
import { expect, test } from "vitest";
import { createTestOrder, loginTest } from "../../helper.ts";
import { ordersPathUrl } from "../shared.ts";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus.ts";
import { orderStatusOptions } from "../../../src/modules/order/domain/orderStatus.ts";
import { orderPaymentStatusOptions } from "../../../src/modules/order/domain/orderPaymentStatus.ts";

const statusCases = {
  [orderStatusOptions.CANCELED]: async () => {
    await createTestOrder({ 
      orderStatus: orderStatusOptions.CANCELED,
      paymentInfo: {
        paymentStatus: orderPaymentStatusOptions.REFUNDED,
        paymentAt: new Date(),
        paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
  },
  [orderStatusOptions.DELIVERED]: async () => {
    await createTestOrder({
      orderStatus: orderStatusOptions.DELIVERED,
      paymentInfo: {
        paymentStatus: orderPaymentStatusOptions.PAID,
        paymentAt: new Date(),
        paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
  },
  [orderStatusOptions.RETURNED]: async () => {
    await createTestOrder({
      orderStatus: orderStatusOptions.RETURNED,
      paymentInfo: {
        paymentStatus: orderPaymentStatusOptions.REFUNDED,
        paymentAt: new Date(),
        paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
  },
  [orderStatusOptions.WAITING_FOR_PAYMENT]: async () => {
    await createTestOrder({
      orderStatus: orderStatusOptions.WAITING_FOR_PAYMENT,
      paymentInfo: {
        paymentStatus: orderPaymentStatusOptions.PENDING,
        paymentAt: null,
        paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
  },
  [orderStatusOptions.SHIPPED]: async () => {
    await createTestOrder({
      orderStatus: orderStatusOptions.SHIPPED,
      paymentInfo: {
        paymentStatus: orderPaymentStatusOptions.PAID,
        paymentAt: new Date(),
        paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
  },
  [orderStatusOptions.WAITING_FOR_SHIPMENT]: async () => {
    await createTestOrder({
      orderStatus: orderStatusOptions.WAITING_FOR_SHIPMENT,
      paymentInfo: {
        paymentStatus: orderPaymentStatusOptions.PAID,
        paymentAt: new Date(),
        paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
  },
} as const;

test("list orders with status...", async () => {
  for (let i = 0; i < 20; i++) await createTestOrder();

  const token = await loginTest();
  const limit = 10;
  const offset = 0;

  for (const [orderStatus, createOrder] of Object.entries(statusCases)) {
    await createOrder();

    const response = await api
      .get(ordersPathUrl)
      .query({
        limit,
        offset,
        orderStatus,
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
        orderStatus: orderStatus,
        customerEmail: expect.any(String),
        totalAmount: expect.any(Number),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        paymentStatus: expect.toBeOneOf(
          Object.values(orderPaymentStatusOptions)
        ),
      });
    });

    expect(response.body.meta).toMatchObject({
      limit,
      offset,
      currentOrdersCount: response.body.orders.length,
      storedOrdersCount: expect.any(Number),
    });
  }
});
