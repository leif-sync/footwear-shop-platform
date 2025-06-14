import { UUID } from "../../../shared/domain/UUID.js";
import { PaymentOrder } from "../PaymentOrder.js";

export class PaymentDeadlineExceededError extends Error {
  constructor(params: { orderId: string | UUID; paymentDeadline: Date });
  constructor(params: { paymentOrder: PaymentOrder });

  constructor(
    params:
      | { orderId: string | UUID; paymentDeadline: Date }
      | { paymentOrder: PaymentOrder }
  ) {
    const isPaymentOrderPresent = "paymentOrder" in params;

    if (!isPaymentOrderPresent) {
      const orderId =
        params.orderId instanceof UUID
          ? params.orderId.getValue()
          : params.orderId;
      const paymentDeadline = params.paymentDeadline.toISOString();
      super(
        `Payment deadline exceeded for order with ID: ${orderId}. Deadline was: ${paymentDeadline}`
      );
    }

    if (isPaymentOrderPresent) {
      const paymentOrder = params.paymentOrder;
      const orderId = paymentOrder.getOrderId().getValue();
      const paymentDeadline = paymentOrder.isPaymentExpired()
        ? paymentOrder.getPaymentDeadline().toISOString()
        : "not applicable";
      super(
        `Payment deadline exceeded for order with ID: ${orderId}. Deadline was: ${paymentDeadline}`
      );
    }
  }
}
