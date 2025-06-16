export enum orderPaymentStatusOptions {
  IN_PAYMENT_GATEWAY = "IN_PAYMENT_GATEWAY",
  PENDING = "PENDING",
  PAID = "PAID",
  EXPIRED = "EXPIRED",
  REFUNDED = "REFUNDED",
}

const paymentStatusOptionsSet = new Set(
  Object.values(orderPaymentStatusOptions)
);


export class OrderPaymentStatus {
  private readonly value: orderPaymentStatusOptions;

  constructor(value: orderPaymentStatusOptions) {
    if (!paymentStatusOptionsSet.has(value))
      throw new Error("Invalid payment status");

    this.value = value;
  }

  getValue() {
    return this.value;
  }

  static readonly create = {
    pending: () => new OrderPaymentStatus(orderPaymentStatusOptions.PENDING),
    paid: () => new OrderPaymentStatus(orderPaymentStatusOptions.PAID),
    expired: () => new OrderPaymentStatus(orderPaymentStatusOptions.EXPIRED),
    inPaymentGateway: () =>
      new OrderPaymentStatus(orderPaymentStatusOptions.IN_PAYMENT_GATEWAY),
    refunded: () => new OrderPaymentStatus(orderPaymentStatusOptions.REFUNDED),
  };

  static clone(orderPaymentStatus: OrderPaymentStatus): OrderPaymentStatus {
    return new OrderPaymentStatus(orderPaymentStatus.getValue());
  }

  equals(status: OrderPaymentStatus | orderPaymentStatusOptions): boolean {
    if (status instanceof OrderPaymentStatus)
      return this.value === status.getValue();
    return this.value === status;
  }
}
