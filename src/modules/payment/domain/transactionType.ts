export enum TransactionTypeOptions {
  PAYMENT = "PAYMENT",
  REFUND = "REFUND",
}

export class TransactionTypeError extends Error {
  constructor(params: { invalidTransactionType: string }) {
    super(`Invalid transaction type: ${params.invalidTransactionType}`);
  }
}

export class TransactionType {
  private readonly value: TransactionTypeOptions;

  constructor(value: TransactionTypeOptions) {
    this.value = value;
  }

  static clone(transactionType: TransactionType) {
    return new TransactionType(transactionType.getValue());
  }

  static create = {
    payment: () => new TransactionType(TransactionTypeOptions.PAYMENT),
    refund: () => new TransactionType(TransactionTypeOptions.REFUND),
  };

  getValue() {
    return this.value;
  }

  equals(other: TransactionType | TransactionTypeOptions) {
    const valueToCompare =
      other instanceof TransactionType ? other.getValue() : other;

    return this.value === valueToCompare;
  }

  isPayment() {
    return this.equals(TransactionTypeOptions.PAYMENT);
  }

  isRefund() {
    return this.equals(TransactionTypeOptions.REFUND);
  }

  static from(value: string): TransactionType {
    if (
      !Object.values(TransactionTypeOptions).includes(
        value as TransactionTypeOptions
      )
    ) {
      throw new Error(`Invalid transaction type: ${value}`);
    }
    return new TransactionType(value as TransactionTypeOptions);
  }
}
