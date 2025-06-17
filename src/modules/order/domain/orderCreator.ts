export enum OrderCreatorOptions {
  ADMIN = "ADMIN",
  GUEST = "GUEST",
}

export class OrderCreator {
  private readonly creatorType: OrderCreatorOptions;

  constructor(creatorType: OrderCreatorOptions) {
    this.creatorType = creatorType;
  }

  static clone(orderCreator: OrderCreator): OrderCreator {
    return new OrderCreator(orderCreator.getValue());
  }

  static create = {
    admin: () => new OrderCreator(OrderCreatorOptions.ADMIN),
    guest: () => new OrderCreator(OrderCreatorOptions.GUEST),
  };

  getValue(): OrderCreatorOptions {
    return this.creatorType;
  }
}
