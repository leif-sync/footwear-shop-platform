import { paymentsPathUrl } from "../shared";
import { api } from "../../api";
import { test, expect } from "vitest";
import { createTestOrder } from "../../helper";
import { OrderPaymentStatusOptions } from "../../../src/modules/order/domain/orderPaymentStatus";
import { OrderStatusOptions } from "../../../src/modules/order/domain/orderStatus";
import { CurrencyOptions } from "../../../src/modules/payment/domain/currency";
import { PaymentProcessorOptions } from "../../../src/modules/payment/domain/paymentProcessor";
import { PaymentTransactionStatusOptions } from "../../../src/modules/payment/domain/paymentTransactionStatus";
import { TransactionTypeOptions } from "../../../src/modules/payment/domain/transactionType";
import { ServiceContainer } from "../../../src/modules/shared/infrastructure/serviceContainer";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";

test("get payment by id without auth", async () => {
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

  const response = await api.get(`${paymentsPathUrl}/${transactionId}`);

  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
});
