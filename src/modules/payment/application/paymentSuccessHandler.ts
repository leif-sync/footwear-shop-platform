import { UUID } from "../../shared/domain/UUID.js";
import { InvalidOrderError } from "../domain/errors/invalidOrderError.js";
import { PaymentAlreadyMadeError } from "../domain/errors/paymentAlreadyMadeError.js";
import { PaymentDeadlineExceededError } from "../domain/errors/paymentDeadlineExceededError.js";
import { PaymentAssociatedDataProvider } from "../domain/PaymentAssociatedDataProvider.js";
import { PaymentOrderNotifier } from "../infrastructure/paymentOrderNotifier.js";

export class PaymentSuccessHandler {
  private readonly paymentAssociatedDataProvider: PaymentAssociatedDataProvider;
  private readonly paymentOrderNotifier: PaymentOrderNotifier;

  constructor(params: {
    paymentAssociatedDataProvider: PaymentAssociatedDataProvider;
    paymentOrderNotifier: PaymentOrderNotifier;
  }) {
    const { paymentAssociatedDataProvider, paymentOrderNotifier } = params;
    this.paymentAssociatedDataProvider = paymentAssociatedDataProvider;
    this.paymentOrderNotifier = paymentOrderNotifier;
  }

  async run(params: { orderId: UUID }) {
    const { orderId } = params;

    const paymentOrder =
      await this.paymentAssociatedDataProvider.findPaymentOrder({
        orderId,
      });

    if (!paymentOrder) throw new InvalidOrderError({ orderId });

    if (paymentOrder.isOrderPaid()) {
      throw new PaymentAlreadyMadeError({ orderId });
    }

    if (paymentOrder.isPaymentExpired()) {
      throw new PaymentDeadlineExceededError({ paymentOrder });
    }

    await this.paymentAssociatedDataProvider.markOrderAsWaitingForShipment({
      orderId,
    });

    await this.paymentOrderNotifier.sendPaymentConfirmationEmail({
      orderId,
    });
  }
}
