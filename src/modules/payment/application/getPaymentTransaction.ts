import { UUID } from "../../shared/domain/UUID.js";
import { PaymentTransactionNotFoundError } from "../domain/errors/paymentTransactionNotFoundError.js";
import { PaymentTransactionRepository } from "../domain/paymentTransactionRepository.js";

export class GetPaymentTransaction {
  private readonly paymentTransactionRepository: PaymentTransactionRepository;

  constructor(params: {
    paymentTransactionRepository: PaymentTransactionRepository;
  }) {
    this.paymentTransactionRepository = params.paymentTransactionRepository;
  }

  async run(params: { transactionId: string }) {
    const transactionId = new UUID(params.transactionId);

    const transactionFound = await this.paymentTransactionRepository.find({
      transactionId,
    });

    if (!transactionFound) {
      throw new PaymentTransactionNotFoundError({ transactionId });
    }

    return transactionFound.toPrimitives();
  }
}
