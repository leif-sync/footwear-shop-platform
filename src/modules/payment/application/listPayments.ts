import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { PaymentTransactionRepository } from "../domain/paymentTransactionRepository.js";
import {
  PaymentTransactionStatus,
  PaymentTransactionStatusOptions,
} from "../domain/paymentTransactionStatus.js";

export class ListPayments {
  private readonly paymentTransactionRepository: PaymentTransactionRepository;

  constructor(params: {
    paymentTransactionRepository: PaymentTransactionRepository;
  }) {
    this.paymentTransactionRepository = params.paymentTransactionRepository;
  }

  async run(params: {
    limit: number;
    offset: number;
    status?: PaymentTransactionStatusOptions;
  }) {
    const limit = new PositiveInteger(params.limit);
    const offset = new NonNegativeInteger(params.offset);
    const status = params.status
      ? new PaymentTransactionStatus(params.status)
      : undefined;

    const transactions = await this.paymentTransactionRepository.list({
      limit,
      offset,
      status,
    });

    return transactions.map((transaction) => transaction.toPrimitives());
  }
}
