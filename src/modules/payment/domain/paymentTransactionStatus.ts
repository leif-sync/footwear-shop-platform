export enum PaymentTransactionStatusOptions {
  APPROVED = "APPROVED",
  DECLINED = "DECLINED",
  CANCELED = "CANCELED",
  PENDING = "PENDING",
}

export class PaymentTransactionStatus {
  private readonly value: PaymentTransactionStatusOptions;

  constructor(value: PaymentTransactionStatusOptions) {
    this.value = value;
  }

  static clone(transactionStatus: PaymentTransactionStatus) {
    return new PaymentTransactionStatus(transactionStatus.getValue());
  }

  static create = {
    approved: () =>
      new PaymentTransactionStatus(PaymentTransactionStatusOptions.APPROVED),
    declined: () =>
      new PaymentTransactionStatus(PaymentTransactionStatusOptions.DECLINED),
    canceled: () =>
      new PaymentTransactionStatus(PaymentTransactionStatusOptions.CANCELED),
    pending: () =>
      new PaymentTransactionStatus(PaymentTransactionStatusOptions.PENDING),
  };

  getValue() {
    return this.value;
  }

  equals(other: PaymentTransactionStatus | PaymentTransactionStatusOptions) {
    const valueToCompare =
      other instanceof PaymentTransactionStatus ? other.getValue() : other;

    return this.value === valueToCompare;
  }

  isApproved() {
    return this.equals(PaymentTransactionStatusOptions.APPROVED);
  }
}
