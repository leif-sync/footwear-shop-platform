import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { InvalidOrderError } from "../domain/errors/invalidOrderError.js";
import { PaymentAlreadyMadeError } from "../domain/errors/paymentAlreadyMadeError.js";
import { PaymentDeadlineExceededError } from "../domain/errors/paymentDeadlineExceededError.js";
import { PaymentNotApprovedError } from "../domain/errors/paymentNotApproved.js";
import { PaymentNotFromGatewayError } from "../domain/errors/paymentNotFromGatewayError.js";
import { PaymentAssociatedDataProvider } from "../domain/PaymentAssociatedDataProvider.js";
import { PaymentTransaction } from "../domain/paymentTransaction.js";
import { PaymentTransactionRepository } from "../domain/paymentTransactionRepository.js";
import { PaymentOrderNotifier } from "../infrastructure/paymentOrderNotifier.js";

type ProcessCashBackTransaction = (params: {
  gatewaySessionId: string;
  amount: NonNegativeInteger;
  orderId: UUID;
}) => Promise<PaymentTransaction>;

export class PaymentGatewaySuccessHandler {
  private readonly paymentAssociatedDataProvider: PaymentAssociatedDataProvider;
  private readonly paymentOrderNotifier: PaymentOrderNotifier;
  private readonly paymentTransactionRepository: PaymentTransactionRepository;

  constructor(params: {
    paymentAssociatedDataProvider: PaymentAssociatedDataProvider;
    paymentOrderNotifier: PaymentOrderNotifier;
    paymentTransactionRepository: PaymentTransactionRepository;
  }) {
    const {
      paymentAssociatedDataProvider,
      paymentOrderNotifier,
      paymentTransactionRepository,
    } = params;
    this.paymentAssociatedDataProvider = paymentAssociatedDataProvider;
    this.paymentOrderNotifier = paymentOrderNotifier;
    this.paymentTransactionRepository = paymentTransactionRepository;
  }

  /**
   * Handles the success of a payment gateway transaction.
   * If a payment with the same gateway session ID already exists, it does nothing.
   * @param params - The parameters containing the payment transaction.
   * @throws { PaymentNotFromGatewayError } If the payment does not come from a gateway.
   * @throws { PaymentNotApprovedError } If the payment is not approved.
   * @throws { InvalidOrderError } If the order associated with the payment does not exist. It also processes a cash back transaction.
   * @throws { PaymentAlreadyMadeError } If the order has already been paid. It also processes a cash back transaction.
   * @throws { PaymentDeadlineExceededError } If the payment deadline for the order has passed. It also processes a cash back transaction.
   */
  async run(params: {
    paymentTransaction: PaymentTransaction;
    processCashBack: ProcessCashBackTransaction;
  }) {
    const { paymentTransaction } = params;
    const gatewaySessionId = paymentTransaction.getGatewaySessionId();
    const paymentId = paymentTransaction.getId();
    const amount = paymentTransaction.getAmount();

    if (!gatewaySessionId) {
      throw new PaymentNotFromGatewayError({
        paymentId: paymentId,
      });
    }

    const isTheSamePaymentGatewaySession =
      await this.paymentTransactionRepository.exists({
        gatewaySessionId,
      });

    if (isTheSamePaymentGatewaySession) return;

    await this.paymentTransactionRepository.create({ paymentTransaction });

    const isValidPayment = paymentTransaction.isPaymentAndApproved();
    if (!isValidPayment) throw new PaymentNotApprovedError({ paymentId });

    const orderId = new UUID(paymentTransaction.getOrderId());

    const paymentOrder =
      await this.paymentAssociatedDataProvider.findPaymentOrder({
        orderId,
      });

    if (!paymentOrder) {
      const refundTransaction = await params.processCashBack({
        orderId,
        gatewaySessionId,
        amount,
      });
      await this.paymentTransactionRepository.create({
        paymentTransaction: refundTransaction,
      });
      throw new InvalidOrderError({ orderId });
    }

    if (paymentOrder.isOrderPaid()) {
      const refundTransaction = await params.processCashBack({
        orderId,
        gatewaySessionId,
        amount,
      });
      await this.paymentTransactionRepository.create({
        paymentTransaction: refundTransaction,
      });
      throw new PaymentAlreadyMadeError({ orderId });
    }

    if (paymentOrder.isPaymentExpired()) {
      const refundTransaction = await params.processCashBack({
        orderId,
        gatewaySessionId,
        amount,
      });
      await this.paymentTransactionRepository.create({
        paymentTransaction: refundTransaction,
      });
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
