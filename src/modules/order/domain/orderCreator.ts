export enum OrderCreatorOptions {
  ADMIN = "ADMIN",
  GUEST = "GUEST",
}

export class OrderCreatorError extends Error {
  constructor(params: { invalidCreatorType: string }) {
    super(`Invalid order creator type: ${params.invalidCreatorType}`);
  }
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

  static from(value: string): OrderCreator {
    const creatorType = Object.values(OrderCreatorOptions).find(
      (type) => type === value
    );

    if (!creatorType) {
      throw new OrderCreatorError({ invalidCreatorType: value });
    }

    return new OrderCreator(creatorType);
  }
}
