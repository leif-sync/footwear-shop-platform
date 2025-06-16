import { UUID } from "../../shared/domain/UUID.js";
import { OrderCreator } from "./orderCreator.js";

export class OrderCreatorDetails {
  private readonly orderCreator: OrderCreator;
  private readonly creatorId: UUID | undefined;

  constructor(params: {
    orderCreator: OrderCreator;
    creatorId?: UUID | undefined;
  }) {
    const { orderCreator, creatorId } = params;
    this.orderCreator = orderCreator;
    this.creatorId = creatorId;
  }

  static clone(orderCreatedBy: OrderCreatorDetails): OrderCreatorDetails {
    return new OrderCreatorDetails({
      orderCreator: orderCreatedBy.orderCreator,
      creatorId: orderCreatedBy.creatorId,
    });
  }

  getCreatorType() {
    return this.orderCreator;
  }

  getCreatorId(): UUID | undefined {
    return this.creatorId;
  }

  toPrimitives() {
    return {
      creator: this.orderCreator.getValue(),
      creatorId: this.creatorId ? this.creatorId.getValue() : undefined,
    };
  }
}
