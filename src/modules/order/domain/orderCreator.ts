export const orderCreatorOptions = {
  ADMIN: "ADMIN",
  GUEST: "GUEST",
} as const;
export type orderCreatorOptions =
  (typeof orderCreatorOptions)[keyof typeof orderCreatorOptions];

export class OrderCreator {
  private readonly creatorType: orderCreatorOptions;

  constructor(creatorType: orderCreatorOptions) {
    this.creatorType = creatorType;
  }

  static clone(orderCreator: OrderCreator): OrderCreator {
    return new OrderCreator(orderCreator.getValue());
  }

  static create = {
    admin: () => new OrderCreator(orderCreatorOptions.ADMIN),
    guest: () => new OrderCreator(orderCreatorOptions.GUEST),
  };

  getValue() {
    return this.creatorType;
  }
}
