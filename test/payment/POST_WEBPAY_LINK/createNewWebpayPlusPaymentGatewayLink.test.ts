import { expect, test, vi, beforeEach } from "vitest";
import { api } from "../../api";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import { paymentsPathUrl } from "../shared";
import { createTestOrder } from "../../helper";
import { orderStatusOptions } from "../../../src/modules/order/domain/orderStatus";
import { orderPaymentStatusOptions } from "../../../src/modules/order/domain/orderPaymentStatus";
import crypto from "node:crypto";

beforeEach(() => {
  vi.clearAllMocks();
});

vi.mock("../../../src/modules/payment/infrastructure/webpaySdkHelper", () => ({
  WebpaySdkHelper: {
    createLinkPaymentGateway: vi.fn().mockResolvedValue({
      url: "https://webpay.example.com/pay",
      token: Math.random().toString(36).substring(2, 15),
    }),
  },
}));

test("creating a new Webpay Plus payment gateway link", async () => {
  const { orderId } = await createTestOrder({
    orderStatus: orderStatusOptions.WAITING_FOR_PAYMENT,
    paymentInfo: {
      paymentStatus: orderPaymentStatusOptions.IN_PAYMENT_GATEWAY,
      paymentAt: null,
      paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
    },
  });

  const response = await api
    .post(`${paymentsPathUrl}/gateways/webpay-plus/init`)
    .send({
      orderId,
    });

  expect(response.statusCode).toBe(HTTP_STATUS.OK);
});

test("creating a new Webpay Plus payment gateway link with invalid order", async () => {
  const response = await api
    .post(`${paymentsPathUrl}/gateways/webpay-plus/init`)
    .send({
      orderId: crypto.randomUUID(), // Invalid order ID
    });

  expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
});

test("creating a new Webpay Plus payment gateway link with already paid order", async () => {
  const { orderId } = await createTestOrder({
    orderStatus: orderStatusOptions.WAITING_FOR_SHIPMENT,
    paymentInfo: {
      paymentStatus: orderPaymentStatusOptions.PAID,
      paymentAt: new Date(),
      paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
    },
  });

  const response = await api
    .post(`${paymentsPathUrl}/gateways/webpay-plus/init`)
    .send({
      orderId,
    });

  expect(response.statusCode).toBe(HTTP_STATUS.CONFLICT);
});

test("creating a new Webpay Plus payment gateway link with expired payment deadline", async () => {
  const paymentDeadlineTest = new Date(Date.now() - 1000 * 60 * 60 * 24);

  const { orderId } = await createTestOrder({
    orderStatus: orderStatusOptions.WAITING_FOR_PAYMENT,
    paymentInfo: {
      paymentStatus: orderPaymentStatusOptions.IN_PAYMENT_GATEWAY,
      paymentAt: null,
      paymentDeadline: paymentDeadlineTest, // 1 day ago
    },
  });

  const response = await api
    .post(`${paymentsPathUrl}/gateways/webpay-plus/init`)
    .send({
      orderId,
    });

  expect(response.statusCode).toBe(HTTP_STATUS.CONFLICT);
});
