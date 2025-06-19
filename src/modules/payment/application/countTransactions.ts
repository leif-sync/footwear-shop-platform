import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import {
  PaymentFilterCriteria,
  PaymentTransactionRepository,
} from "../domain/paymentTransactionRepository.js";

export class CountTransactions {
  private readonly paymentTransactionRepository: PaymentTransactionRepository;

  constructor(params: {
    paymentTransactionRepository: PaymentTransactionRepository;
  }) {
    this.paymentTransactionRepository = params.paymentTransactionRepository;
  }

  async run(params: PaymentFilterCriteria): Promise<NonNegativeInteger> {
    const count = await this.paymentTransactionRepository.count(params);
    return count;
  }
}
