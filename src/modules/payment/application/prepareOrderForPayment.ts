import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { InvalidOrderError } from "../domain/errors/invalidOrderError.js";
import { PaymentAlreadyMadeError } from "../domain/errors/paymentAlreadyMadeError.js";
import { PaymentDeadlineExceededError } from "../domain/errors/paymentDeadlineExceededError.js";
import { IvaCalculator } from "../domain/ivaCalculator.js";
import { PaymentAssociatedDataProvider } from "../domain/PaymentAssociatedDataProvider.js";

export class PrepareOrderForPayment {
  private readonly paymentAssociatedDataProvider: PaymentAssociatedDataProvider;

  constructor(params: {
    paymentAssociatedDataProvider: PaymentAssociatedDataProvider;
  }) {
    this.paymentAssociatedDataProvider = params.paymentAssociatedDataProvider;
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

    const finalAmount = paymentOrder.getFinalAmount();
    const iva = IvaCalculator.calculateIva({ amount: finalAmount });

    const invoiceAmount = new NonNegativeInteger(
      finalAmount.getValue() + iva.getValue()
    );

    return {
      orderId,
      invoiceAmount,
    };
  }
}
