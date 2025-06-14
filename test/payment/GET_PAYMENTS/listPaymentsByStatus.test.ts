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
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";

test("list payments by status", async () => {
  const cookieToken = await loginTest();
  const validPaymentStatus = Object.values(PaymentTransactionStatusOptions);
  const invalidPaymentStatus = "INVALID_STATUS";
  const limit = 10;
  const offset = 0;

  // create a test order
  const { orderId } = await createTestOrder({
    orderStatus: orderStatusOptions.WAITING_FOR_PAYMENT,
    paymentInfo: {
      paymentStatus: orderPaymentStatusOptions.PENDING,
      paymentAt: null,
      paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  for (const status of validPaymentStatus) {
    // create a payment transaction with the current status
    await ServiceContainer.payment.createPaymentTransaction.run({
      amount: 1000,
      createdAt: new Date(),
      currency: CurrencyOptions.CLP,
      orderId,
      paymentProcessor: PaymentProcessorOptions.WEBPAY,
      rawResponse: "test-raw-response",
      transactionStatus: status,
      transactionType: TransactionTypeOptions.PAYMENT,
      updatedAt: new Date(),
    });

    const response = await api
      .get(paymentsPathUrl)
      .query({
        limit,
        offset,
        status,
      })
      .set("Cookie", cookieToken);

    expect(response.ok).toBe(true);
    expect(response.body.payments.length).toBeGreaterThanOrEqual(1);
    expect(response.body.payments).toBeInstanceOf(Array);
    expect(response.body.meta).toBeInstanceOf(Object);

    response.body.payments.forEach((payment) => {
      expect(payment).toMatchObject({
        transactionStatus: status,
      });
    });
  }

  // Test with an invalid status

  const invalidResponse = await api
    .get(paymentsPathUrl)
    .query({
      limit,
      offset,
      status: invalidPaymentStatus,
    })
    .set("Cookie", cookieToken);
  expect(invalidResponse.ok).toBe(false);
  expect(invalidResponse.status).toBe(HTTP_STATUS.BAD_REQUEST);
});
