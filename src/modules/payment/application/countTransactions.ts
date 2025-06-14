import { PaymentTransactionRepository } from "../domain/paymentTransactionRepository.js";
import {
  PaymentTransactionStatus,
  PaymentTransactionStatusOptions,
} from "../domain/paymentTransactionStatus.js";

export class CountTransactions {
  private readonly paymentTransactionRepository: PaymentTransactionRepository;

  constructor(params: {
    paymentTransactionRepository: PaymentTransactionRepository;
  }) {
    this.paymentTransactionRepository = params.paymentTransactionRepository;
  }

  async run(params: { status?: PaymentTransactionStatusOptions }): Promise<number> {
    const transactionStatus = params.status
      ? new PaymentTransactionStatus(params.status)
      : undefined;

    const count = await this.paymentTransactionRepository.count({
      status: transactionStatus,
    });

    return count.getValue();
  }
}
