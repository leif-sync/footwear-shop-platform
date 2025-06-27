export enum OrderStatusOptions {
  WAITING_FOR_PAYMENT = "WAITING_FOR_PAYMENT",
  WAITING_FOR_SHIPMENT = "WAITING_FOR_SHIPMENT",
  SHIPPED = "SHIPPED",
  CANCELED = "CANCELED",
  DELIVERED = "DELIVERED",
  RETURNED = "RETURNED",
}

export class OrderStatusError extends Error {
  constructor(params: { invalidOrderStatus: string }) {
    super(`Invalid order status: ${params.invalidOrderStatus}`);
  }
}

export class OrderStatus {
  private readonly value: OrderStatusOptions;

  constructor(value: OrderStatusOptions) {
    this.value = value;
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

  getValue() {
    return this.value;
  }

  equals(status: OrderStatus | OrderStatusOptions): boolean {
    if (status instanceof OrderStatus) return this.value === status.getValue();
    return this.value === status;
  }

  static from(value: string): OrderStatus {
    const status = Object.values(OrderStatusOptions).find(
      (option) => option === value
    );
    if (!status) {
      throw new OrderStatusError({ invalidOrderStatus: value });
    }
    return new OrderStatus(status);
  }
}
