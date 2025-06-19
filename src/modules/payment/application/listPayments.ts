import { PrimitivePaymentTransaction } from "../domain/paymentTransaction.js";
import {
  PaginatedPaymentFilterCriteria,
  PaymentTransactionRepository,
} from "../domain/paymentTransactionRepository.js";

export class ListPayments {
  private readonly paymentTransactionRepository: PaymentTransactionRepository;

  constructor(params: {
    paymentTransactionRepository: PaymentTransactionRepository;
  }) {
    this.paymentTransactionRepository = params.paymentTransactionRepository;
  }

  async run(
    params: PaginatedPaymentFilterCriteria
  ): Promise<PrimitivePaymentTransaction[]> {
    const transactions = await this.paymentTransactionRepository.list(params);
    return transactions.map((transaction) => transaction.toPrimitives());
  }
}
