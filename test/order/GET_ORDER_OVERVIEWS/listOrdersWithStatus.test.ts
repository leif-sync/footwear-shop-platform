import { api } from "../../api.ts";
import { expect, test } from "vitest";
import { createTestOrder, loginTest } from "../../helper.ts";
import { ordersPathUrl } from "../shared.ts";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus.ts";
import { OrderStatusOptions } from "../../../src/modules/order/domain/orderStatus.ts";
import { OrderPaymentStatusOptions } from "../../../src/modules/order/domain/orderPaymentStatus.ts";

const statusCases = {
  [OrderStatusOptions.CANCELED]: async () => {
    await createTestOrder({ 
      orderStatus: OrderStatusOptions.CANCELED,
      paymentInfo: {
        paymentStatus: OrderPaymentStatusOptions.REFUNDED,
        paymentAt: new Date(),
        paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
  },
  [OrderStatusOptions.DELIVERED]: async () => {
    await createTestOrder({
      orderStatus: OrderStatusOptions.DELIVERED,
      paymentInfo: {
        paymentStatus: OrderPaymentStatusOptions.PAID,
        paymentAt: new Date(),
        paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
  },
  [OrderStatusOptions.RETURNED]: async () => {
    await createTestOrder({
      orderStatus: OrderStatusOptions.RETURNED,
      paymentInfo: {
        paymentStatus: OrderPaymentStatusOptions.REFUNDED,
        paymentAt: new Date(),
        paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
  },
  [OrderStatusOptions.WAITING_FOR_PAYMENT]: async () => {
    await createTestOrder({
      orderStatus: OrderStatusOptions.WAITING_FOR_PAYMENT,
      paymentInfo: {
        paymentStatus: OrderPaymentStatusOptions.PENDING,
        paymentAt: null,
        paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
  },
  [OrderStatusOptions.SHIPPED]: async () => {
    await createTestOrder({
      orderStatus: OrderStatusOptions.SHIPPED,
      paymentInfo: {
        paymentStatus: OrderPaymentStatusOptions.PAID,
        paymentAt: new Date(),
        paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
  },
  [OrderStatusOptions.WAITING_FOR_SHIPMENT]: async () => {
    await createTestOrder({
      orderStatus: OrderStatusOptions.WAITING_FOR_SHIPMENT,
      paymentInfo: {
        paymentStatus: OrderPaymentStatusOptions.PAID,
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
          Object.values(OrderPaymentStatusOptions)
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
