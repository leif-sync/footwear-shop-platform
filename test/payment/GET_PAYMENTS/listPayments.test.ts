import { expect, test } from "vitest";
import { api } from "../../api";
import { paymentsPathUrl } from "../shared";
import { PaymentTransactionStatusOptions } from "../../../src/modules/payment/domain/paymentTransactionStatus";
import { TransactionTypeOptions } from "../../../src/modules/payment/domain/transactionType";
import { PaymentProcessorOptions } from "../../../src/modules/payment/domain/paymentProcessor";
import { CurrencyOptions } from "../../../src/modules/payment/domain/currency";
import { createTestOrder, loginTest } from "../../helper";
import { ServiceContainer } from "../../../src/modules/shared/infrastructure/serviceContainer";
import { orderStatusOptions } from "../../../src/modules/order/domain/orderStatus";
import { orderPaymentStatusOptions } from "../../../src/modules/order/domain/orderPaymentStatus";

test("list payments", async () => {
  const cookieToken = await loginTest();

  const { orderId } = await createTestOrder({
    orderStatus: orderStatusOptions.WAITING_FOR_PAYMENT,
    paymentInfo: {
      paymentStatus: orderPaymentStatusOptions.PENDING,
      paymentAt: null,
      paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  await ServiceContainer.payment.createPaymentTransaction.run({
    amount: 1000,
    createdAt: new Date(),
    currency: CurrencyOptions.CLP,
    orderId,
    paymentProcessor: PaymentProcessorOptions.WEBPAY,
    rawResponse: "test-raw-response",
    transactionStatus: PaymentTransactionStatusOptions.APPROVED,
    transactionType: TransactionTypeOptions.PAYMENT,
    updatedAt: new Date(),
  });

  const limit = 10;
  const offset = 0;

  const response = await api
    .get(paymentsPathUrl)
    .query({
      limit,
      offset,
    })
    .set("Cookie", cookieToken);

  expect(response.ok).toBe(true);
  expect(response.body.payments.length).toBeGreaterThanOrEqual(1);
  expect(response.body.payments).toBeInstanceOf(Array);
  expect(response.body.meta).toBeInstanceOf(Object);

  response.body.payments.forEach((payment) => {
    expect(payment).toMatchObject({
      transactionId: expect.any(String),
      orderId: expect.any(String),
      transactionType: expect.toBeOneOf(Object.keys(TransactionTypeOptions)),
      transactionStatus: expect.toBeOneOf(
        Object.keys(PaymentTransactionStatusOptions)
      ),
      amount: expect.any(Number),
      paymentProcessor: expect.toBeOneOf(Object.keys(PaymentProcessorOptions)),
      rawResponse: expect.any(String),
      currency: expect.toBeOneOf(Object.keys(CurrencyOptions)),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  expect(response.body.meta).toMatchObject({
    limit,
    offset,
    currentTransactionsCount: response.body.payments.length,
    storedTransactionsCount: 1,
  });
});
