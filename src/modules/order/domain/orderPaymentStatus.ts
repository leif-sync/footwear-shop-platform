export enum OrderPaymentStatusOptions {
  IN_PAYMENT_GATEWAY = "IN_PAYMENT_GATEWAY",
  PENDING = "PENDING",
  PAID = "PAID",
  EXPIRED = "EXPIRED",
  REFUNDED = "REFUNDED",
}

const paymentStatusOptionsSet = new Set(
  Object.values(OrderPaymentStatusOptions)
);

export class OrderPaymentStatus {
  private readonly value: OrderPaymentStatusOptions;

  constructor(value: OrderPaymentStatusOptions) {
    if (!paymentStatusOptionsSet.has(value))
      throw new Error("Invalid payment status");

    this.value = value;
  }

  getValue() {
    return this.value;
  }

  static readonly create = {
    pending: () => new OrderPaymentStatus(OrderPaymentStatusOptions.PENDING),
    paid: () => new OrderPaymentStatus(OrderPaymentStatusOptions.PAID),
    expired: () => new OrderPaymentStatus(OrderPaymentStatusOptions.EXPIRED),
    inPaymentGateway: () =>
      new OrderPaymentStatus(OrderPaymentStatusOptions.IN_PAYMENT_GATEWAY),
    refunded: () => new OrderPaymentStatus(OrderPaymentStatusOptions.REFUNDED),
  };

  static clone(orderPaymentStatus: OrderPaymentStatus): OrderPaymentStatus {
    return new OrderPaymentStatus(orderPaymentStatus.getValue());
  }

  equals(status: OrderPaymentStatus | OrderPaymentStatusOptions): boolean {
    if (status instanceof OrderPaymentStatus)
      return this.value === status.getValue();
    return this.value === status;
  }
}
