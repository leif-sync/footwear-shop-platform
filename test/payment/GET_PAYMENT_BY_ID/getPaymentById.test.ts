import { paymentsPathUrl } from "../shared";
import { api } from "../../api";
import { test, expect } from "vitest";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import { createTestOrder, loginTest } from "../../helper";
import { OrderPaymentStatusOptions } from "../../../src/modules/order/domain/orderPaymentStatus";
import { OrderStatusOptions } from "../../../src/modules/order/domain/orderStatus";
import { CurrencyOptions } from "../../../src/modules/payment/domain/currency";
import { PaymentProcessorOptions } from "../../../src/modules/payment/domain/paymentProcessor";
import { PaymentTransactionStatusOptions } from "../../../src/modules/payment/domain/paymentTransactionStatus";
import { TransactionTypeOptions } from "../../../src/modules/payment/domain/transactionType";
import { ServiceContainer } from "../../../src/modules/shared/infrastructure/serviceContainer";

test("get payment by id", async () => {
  const { orderId } = await createTestOrder({
    orderStatus: OrderStatusOptions.WAITING_FOR_PAYMENT,
    paymentInfo: {
      paymentStatus: OrderPaymentStatusOptions.PENDING,
      paymentAt: null,
      paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  const transactionToCreate = {
    amount: 1000,
    createdAt: new Date(),
    currency: CurrencyOptions.CLP,
    orderId,
    paymentProcessor: PaymentProcessorOptions.WEBPAY,
    rawResponse: "test-raw-response",
    transactionStatus: PaymentTransactionStatusOptions.APPROVED,
    transactionType: TransactionTypeOptions.PAYMENT,
    updatedAt: new Date(),
  };

  const { transactionId } =
    await ServiceContainer.payment.createPaymentTransaction.run(
      transactionToCreate
    );

  const cookieToken = await loginTest();
  const response = await api
    .get(`${paymentsPathUrl}/${transactionId}`)
    .set("Cookie", cookieToken);

  expect(response.ok).toBe(true);
  expect(response.status).toBe(HTTP_STATUS.OK);
  expect(response.body.paymentTransaction).toMatchObject({
    transactionId,
    orderId,
    transactionType: transactionToCreate.transactionType,
    transactionStatus: transactionToCreate.transactionStatus,
    amount: transactionToCreate.amount,
    paymentProcessor: transactionToCreate.paymentProcessor,
    rawResponse: transactionToCreate.rawResponse,
    currency: transactionToCreate.currency,
    createdAt: transactionToCreate.createdAt.toISOString(),
    updatedAt: transactionToCreate.updatedAt.toISOString(),
  });

});
