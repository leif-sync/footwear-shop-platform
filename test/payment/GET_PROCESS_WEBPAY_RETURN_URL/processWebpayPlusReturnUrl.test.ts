import { expect, test, vi, beforeEach } from "vitest";
import { api } from "../../api";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import { paymentsPathUrl } from "../shared";
import { createTestOrder } from "../../helper";
import { OrderStatusOptions } from "../../../src/modules/order/domain/orderStatus";
import { OrderPaymentStatusOptions } from "../../../src/modules/order/domain/orderPaymentStatus";
import * as webpay from "../../../src/modules/payment/infrastructure/webpaySdkHelper";
import { ServiceContainer } from "../../../src/modules/shared/infrastructure/serviceContainer";
import { UUID } from "../../../src/modules/shared/domain/UUID";

beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

test("processing Webpay Plus payment gateway return URL", async () => {
  const order = await createTestOrder({
    orderStatus: OrderStatusOptions.WAITING_FOR_PAYMENT,
    paymentInfo: {
      paymentStatus: OrderPaymentStatusOptions.IN_PAYMENT_GATEWAY,
      paymentAt: null,
      paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
    },
  });

  const orderId = new UUID(order.orderId);

  vi.spyOn(webpay.WebpaySdkHelper, "commitTransaction").mockResolvedValue({
    vci: webpay.webPayPlusVciOptions.SUCCESSFUL_AUTHENTICATION,
    amount: 10000,
    status: webpay.webpayPlusStatusOptions.AUTHORIZED,
    buy_order: "123456789",
    session_id: orderId.getValue(),
    card_detail: {
      card_number: "3456", // last 4 digits of the card
    },
    accounting_date: "2023-10-01",
    transaction_date: "2023-10-01T12:00:00Z",
    authorization_code: "123456",
    payment_type_code: webpay.webpayPlusPaymentTypeOptions.DEBIT_SALE,
    response_code: webpay.webpayPlusResponseCodeOptions.APPROVED,
    installments_number: 1,
    balance: 0,
  });

  const response = await api
    .get(`${paymentsPathUrl}/gateways/webpay-plus/confirm`)
    .query({
      token_ws: Array(64).fill("a").join(""), // El relleno del token debe ser distinto a de los demás tests
    });

  expect(response.status).toBe(HTTP_STATUS.OK);
  expect(response.body).toEqual({
    invoice: {
      commerceName: expect.any(String),
      currency: "CLP",
      totalAmount: 10000,
      authorizationCode: "123456",
      transactionDate: expect.any(String),
      last4CardDigits: "3456",
      paymentType: "DEBIT",
      installmentsNumber: 1,
    },
  });

  const orderUpdated = await ServiceContainer.order.getOrder.run({
    orderId,
  });

  expect(orderUpdated.status).toBe(OrderStatusOptions.WAITING_FOR_SHIPMENT);
  expect(orderUpdated.paymentInfo.paymentStatus).toBe(
    OrderPaymentStatusOptions.PAID
  );
  expect(orderUpdated.paymentInfo.paymentAt).toBeDefined();
});

test("processing Webpay Plus payment gateway return URL error form pay", async () => {
  const response = await api
    .get(`${paymentsPathUrl}/gateways/webpay-plus/confirm`)
    .query({
      token_ws: Array(64).fill("b").join(""), // El relleno del token debe ser distinto a de los demás tests
      TBK_TOKEN: Array(64).fill("b").join(""), // El relleno del token debe ser distinto a de los demás tests
      TBK_ORDEN_COMPRA: "123456789",
      TBK_ID_SESION: crypto.randomUUID(),
    });

  expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
  expect(response.body.error.code).toBe("PAYMENT_GATEWAY_ERROR");
});

test("processing Webpay Plus payment gateway return URL payment aborted", async () => {
  const response = await api
    .get(`${paymentsPathUrl}/gateways/webpay-plus/confirm`)
    .query({
      TBK_TOKEN: Array(64).fill("c").join(""), // El relleno del token debe ser distinto a de los demás tests
      TBK_ORDEN_COMPRA: "123456789",
      TBK_ID_SESION: crypto.randomUUID(),
    });

  expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
  expect(response.body.error.code).toBe("PAYMENT_ABORTED");
});

test("processing Webpay Plus payment gateway return URL payment timeout", async () => {
  const response = await api
    .get(`${paymentsPathUrl}/gateways/webpay-plus/confirm`)
    .query({
      TBK_ID_SESION: crypto.randomUUID(),
      TBK_ORDEN_COMPRA: "123456789",
    });

  expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
  expect(response.body.error.code).toBe("PAYMENT_TIMEOUT");
});

test("processing Webpay Plus payment gateway return URL with payment not approved", async () => {
  const order = await createTestOrder({
    orderStatus: OrderStatusOptions.WAITING_FOR_PAYMENT,
    paymentInfo: {
      paymentStatus: OrderPaymentStatusOptions.IN_PAYMENT_GATEWAY,
      paymentAt: null,
      paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
    },
  });

  const orderId = new UUID(order.orderId);

  vi.spyOn(webpay.WebpaySdkHelper, "commitTransaction").mockResolvedValue({
    vci: webpay.webPayPlusVciOptions.SUCCESSFUL_AUTHENTICATION,
    amount: 10000,
    status: webpay.webpayPlusStatusOptions.FAILED,
    buy_order: "12345678R9",
    session_id: orderId.getValue(),
    card_detail: {
      card_number: "3456", // last 4 digits of the card
    },
    accounting_date: "2023-10-01",
    transaction_date: "2023-10-01T12:00:00Z",
    authorization_code: "123456",
    payment_type_code: webpay.webpayPlusPaymentTypeOptions.DEBIT_SALE,
    response_code: webpay.webpayPlusResponseCodeOptions.REJECTED_BY_BANK,
    installments_number: 1,
    balance: 0,
  });

  const response = await api
    .get(`${paymentsPathUrl}/gateways/webpay-plus/confirm`)
    .query({
      token_ws: Array(64).fill("d").join(""), // El relleno del token debe ser distinto a de los demás tests
    });

  expect(response.status).toBe(HTTP_STATUS.CONFLICT);
  expect(response.body.error.code).toBe("PAYMENT_NOT_APPROVED");

  const orderUpdated = await ServiceContainer.order.getOrder.run({
    orderId,
  });

  expect(orderUpdated.status).toBe(OrderStatusOptions.WAITING_FOR_PAYMENT);
  expect(orderUpdated.paymentInfo.paymentStatus).toBe(
    OrderPaymentStatusOptions.IN_PAYMENT_GATEWAY
  );
  expect(orderUpdated.paymentInfo.paymentAt).toBe(null);
});

test("processing Webpay Plus payment gateway return URL with order not found", async () => {
  vi.spyOn(webpay.WebpaySdkHelper, "commitTransaction").mockResolvedValue({
    vci: webpay.webPayPlusVciOptions.SUCCESSFUL_AUTHENTICATION,
    amount: 10000,
    status: webpay.webpayPlusStatusOptions.AUTHORIZED,
    buy_order: "123456789",
    session_id: UUID.generateRandomUUID().getValue(), // Order ID does not exist
    card_detail: {
      card_number: "3456", // last 4 digits of the card
    },
    accounting_date: "2023-10-01",
    transaction_date: "2023-10-01T12:00:00Z",
    authorization_code: "123456",
    payment_type_code: webpay.webpayPlusPaymentTypeOptions.DEBIT_SALE,
    response_code: webpay.webpayPlusResponseCodeOptions.APPROVED,
    installments_number: 1,
    balance: 0,
  });

  const response = await api
    .get(`${paymentsPathUrl}/gateways/webpay-plus/confirm`)
    .query({
      token_ws: Array(64).fill("e").join(""), // El relleno del token debe ser distinto a de los demás tests
    });

  expect(response.status).toBe(HTTP_STATUS.CONFLICT);
  expect(response.body.error.code).toBe("INVALID_ORDER");
  expect(response.body.error.isPaymentRefunded).toBe(true);
});

test("processing Webpay Plus payment gateway return URL with order already paid", async () => {
  const { orderId } = await createTestOrder({
    orderStatus: OrderStatusOptions.WAITING_FOR_SHIPMENT,
    paymentInfo: {
      paymentStatus: OrderPaymentStatusOptions.PAID,
      paymentAt: new Date(),
      paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
    },
  });

  vi.spyOn(webpay.WebpaySdkHelper, "refundTransaction").mockResolvedValue({
    type: webpay.webpayPlusRefundTypeOptions.REVERSED,
  });

  vi.spyOn(webpay.WebpaySdkHelper, "commitTransaction").mockResolvedValue({
    vci: webpay.webPayPlusVciOptions.SUCCESSFUL_AUTHENTICATION,
    amount: 10000,
    status: webpay.webpayPlusStatusOptions.AUTHORIZED,
    buy_order: "123456D789",
    session_id: orderId,
    card_detail: {
      card_number: "3456", // last 4 digits of the card
    },
    accounting_date: "2023-10-01",
    transaction_date: "2023-10-01T12:00:00Z",
    authorization_code: "123456",
    payment_type_code: webpay.webpayPlusPaymentTypeOptions.DEBIT_SALE,
    response_code: webpay.webpayPlusResponseCodeOptions.APPROVED,
    installments_number: 1,
    balance: 0,
  });

  const response = await api
    .get(`${paymentsPathUrl}/gateways/webpay-plus/confirm`)
    .query({
      token_ws: Array(64).fill("f").join(""), // El relleno del token debe ser distinto a de los demás tests
    });

  expect(response.status).toBe(HTTP_STATUS.CONFLICT);
  expect(response.body.error.code).toBe("PAYMENT_ALREADY_MADE");
  expect(response.body.error.isPaymentRefunded).toBe(true);
});

test("processing Webpay Plus payment gateway return URL with order payment deadline exceeded", async () => {
  const { orderId } = await createTestOrder({
    orderStatus: OrderStatusOptions.WAITING_FOR_PAYMENT,
    paymentInfo: {
      paymentStatus: OrderPaymentStatusOptions.IN_PAYMENT_GATEWAY,
      paymentAt: null,
      paymentDeadline: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
  });

  vi.spyOn(webpay.WebpaySdkHelper, "refundTransaction").mockResolvedValue({
    type: webpay.webpayPlusRefundTypeOptions.REVERSED,
  });

  vi.spyOn(webpay.WebpaySdkHelper, "commitTransaction").mockResolvedValue({
    vci: webpay.webPayPlusVciOptions.SUCCESSFUL_AUTHENTICATION,
    amount: 10000,
    status: webpay.webpayPlusStatusOptions.AUTHORIZED,
    buy_order: "123456F789",
    session_id: orderId,
    card_detail: {
      card_number: "3456", // last 4 digits of the card
    },
    accounting_date: "2023-10-01",
    transaction_date: "2023-10-01T12:00:00Z",
    authorization_code: "123456",
    payment_type_code: webpay.webpayPlusPaymentTypeOptions.DEBIT_SALE,
    response_code: webpay.webpayPlusResponseCodeOptions.APPROVED,
    installments_number: 1,
    balance: 0,
  });

  const response = await api
    .get(`${paymentsPathUrl}/gateways/webpay-plus/confirm`)
    .query({
      token_ws: Array(64).fill("g").join(""), // El relleno del token debe ser distinto a de los demás tests
    });

  expect(response.status).toBe(HTTP_STATUS.CONFLICT);
  expect(response.body.error.code).toBe("PAYMENT_DEADLINE_EXCEEDED");
  expect(response.body.error.isPaymentRefunded).toBe(true);
});

test("processing Webpay Plus payment gateway return URL with transaction already refunded", async () => {
  const { orderId } = await createTestOrder({
    orderStatus: OrderStatusOptions.WAITING_FOR_PAYMENT,
    paymentInfo: {
      paymentStatus: OrderPaymentStatusOptions.IN_PAYMENT_GATEWAY,
      paymentAt: null,
      paymentDeadline: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
  });

  vi.spyOn(webpay.WebpaySdkHelper, "refundTransaction").mockResolvedValue({
    type: webpay.webpayPlusRefundTypeOptions.REVERSED,
  });

  vi.spyOn(webpay.WebpaySdkHelper, "commitTransaction").mockResolvedValue({
    vci: webpay.webPayPlusVciOptions.SUCCESSFUL_AUTHENTICATION,
    amount: 10000,
    status: webpay.webpayPlusStatusOptions.REVERSED,
    buy_order: "123456F789",
    session_id: orderId,
    card_detail: {
      card_number: "3456", // last 4 digits of the card
    },
    accounting_date: "2023-10-01",
    transaction_date: "2023-10-01T12:00:00Z",
    authorization_code: "123456",
    payment_type_code: webpay.webpayPlusPaymentTypeOptions.DEBIT_SALE,
    response_code: webpay.webpayPlusResponseCodeOptions.APPROVED,
    installments_number: 1,
    balance: 0,
  });

  const response = await api
    .get(`${paymentsPathUrl}/gateways/webpay-plus/confirm`)
    .query({
      token_ws: Array(64).fill("h").join(""), // El relleno del token debe ser distinto a de los demás tests
    });

  expect(response.ok).toBe(false);
});
