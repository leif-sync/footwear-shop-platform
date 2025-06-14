export enum TransactionTypeOptions {
  PAYMENT = "PAYMENT",
  REFUND = "REFUND",
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
}
