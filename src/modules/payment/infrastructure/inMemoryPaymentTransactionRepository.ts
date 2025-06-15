import { UUID } from "../../shared/domain/UUID.js";
import { PaymentTransactionRepository } from "../domain/paymentTransactionRepository.js";
import { PaymentTransaction } from "../domain/paymentTransaction.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { PaymentTransactionStatus } from "../domain/paymentTransactionStatus.js";

export class InMemoryPaymentTransactionRepository
  implements PaymentTransactionRepository
{
  private transactions: PaymentTransaction[] = [];

  async list(params: {
    limit: PositiveInteger;
    offset: NonNegativeInteger;
    status?: PaymentTransactionStatus;
  }): Promise<PaymentTransaction[]> {
    const { limit, offset, status } = params;

    const filteredTransactions = status
      ? this.transactions.filter((transaction) =>
          status.equals(transaction.getStatus())
        )
      : this.transactions;

    const paginatedTransactions = filteredTransactions.slice(
      offset.getValue(),
      offset.getValue() + limit.getValue()
    );

    return paginatedTransactions.map(PaymentTransaction.clone);
  }

  async count(params: {
    status?: PaymentTransactionStatus;
  }): Promise<NonNegativeInteger> {
    const { status } = params;

    const filteredTransactions = status
      ? this.transactions.filter((transaction) =>
          status.equals(transaction.getStatus())
        )
      : this.transactions;

    return new NonNegativeInteger(filteredTransactions.length);
  }

  async create(params: {
    paymentTransaction: PaymentTransaction;
  }): Promise<void> {
    const transaction = PaymentTransaction.clone(params.paymentTransaction);
    this.transactions.push(transaction);
  }

  async find(params: {
    transactionId: UUID;
  }): Promise<PaymentTransaction | null>;
  async find(params: {
    gatewaySessionId: string;
  }): Promise<PaymentTransaction | null>;
  async find(
    params: { transactionId: UUID } | { gatewaySessionId: string }
  ): Promise<PaymentTransaction | null> {
    if ("transactionId" in params) {
      const transaction = this.transactions.find((transaction) =>
        params.transactionId.equals(transaction.getId())
      );
      return transaction ? PaymentTransaction.clone(transaction) : null;
    }

    const transaction = this.transactions.find(
      (transaction) =>
        transaction.getGatewaySessionId() === params.gatewaySessionId
    );
    return transaction ? PaymentTransaction.clone(transaction) : null;
  }

  async exists(params: { transactionId: UUID }): Promise<boolean>;
  async exists(params: { gatewaySessionId: string }): Promise<boolean>;
  async exists(
    params: { transactionId: UUID } | { gatewaySessionId: string }
  ): Promise<boolean> {
    if ("transactionId" in params) {
      return this.transactions.some((transaction) =>
        params.transactionId.equals(transaction.getId())
      );
    }

    return this.transactions.some(
      (transaction) =>
        transaction.getGatewaySessionId() === params.gatewaySessionId
    );
  }
}
