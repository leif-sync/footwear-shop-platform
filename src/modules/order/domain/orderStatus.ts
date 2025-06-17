export enum OrderStatusOptions {
  WAITING_FOR_PAYMENT = "WAITING_FOR_PAYMENT",
  WAITING_FOR_SHIPMENT = "WAITING_FOR_SHIPMENT",
  SHIPPED = "SHIPPED",
  CANCELED = "CANCELED",
  DELIVERED = "DELIVERED",
  RETURNED = "RETURNED",
}

const validOrderStatus = new Set(Object.values(OrderStatusOptions));

export class OrderStatus {
  private readonly value: OrderStatusOptions;

  constructor(value: OrderStatusOptions) {
    this.value = value;
    this.ensureIsValid();
  }

  static readonly create = {
    waitingForPayment: () =>
      new OrderStatus(OrderStatusOptions.WAITING_FOR_PAYMENT),
    waitingForShipment: () =>
      new OrderStatus(OrderStatusOptions.WAITING_FOR_SHIPMENT),
    shipped: () => new OrderStatus(OrderStatusOptions.SHIPPED),
    canceled: () => new OrderStatus(OrderStatusOptions.CANCELED),
    delivered: () => new OrderStatus(OrderStatusOptions.DELIVERED),
    returned: () => new OrderStatus(OrderStatusOptions.RETURNED),
  };

  static clone(orderStatus: OrderStatus): OrderStatus {
    return new OrderStatus(orderStatus.value);
  }

  clone(): OrderStatus {
    return OrderStatus.clone(this);
  }

  private ensureIsValid() {
    if (!validOrderStatus.has(this.value))
      throw new Error("Invalid order status");
  }

  getValue() {
    return this.value;
  }

  equals(status: OrderStatus | OrderStatusOptions): boolean {
    if (status instanceof OrderStatus) return this.value === status.getValue();
    return this.value === status;
  }
}
