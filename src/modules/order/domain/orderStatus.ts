export const orderStatusOptions = {
  WAITING_FOR_PAYMENT: "WAITING_FOR_PAYMENT",
  WAITING_FOR_SHIPMENT: "WAITING_FOR_SHIPMENT",
  SHIPPED: "SHIPPED",
  CANCELED: "CANCELED",
  DELIVERED: "DELIVERED",
  RETURNED: "RETURNED",
} as const;

export type orderStatusOptions = keyof typeof orderStatusOptions;

const validOrderStatus = new Set(Object.values(orderStatusOptions));

export class OrderStatus {
  private readonly value: orderStatusOptions;

  constructor(value: orderStatusOptions) {
    this.value = value;
    this.ensureIsValid();
  }

  static readonly create = {
    waitingForPayment: () =>
      new OrderStatus(orderStatusOptions.WAITING_FOR_PAYMENT),
    waitingForShipment: () =>
      new OrderStatus(orderStatusOptions.WAITING_FOR_SHIPMENT),
    shipped: () => new OrderStatus(orderStatusOptions.SHIPPED),
    canceled: () => new OrderStatus(orderStatusOptions.CANCELED),
    delivered: () => new OrderStatus(orderStatusOptions.DELIVERED),
  };

  static clone(orderStatus: OrderStatus): OrderStatus {
    return new OrderStatus(orderStatus.getValue());
  }

  private ensureIsValid() {
    if (!validOrderStatus.has(this.value))
      throw new Error("Invalid order status");
  }

  getValue() {
    return this.value;
  }

  equals(status: OrderStatus | orderStatusOptions): boolean {
    if (status instanceof OrderStatus) return this.value === status.getValue();
    return this.value === status;
  }
}
