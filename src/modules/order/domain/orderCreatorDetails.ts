import { UUID } from "../../shared/domain/UUID.js";
import { OrderCreator } from "./orderCreator.js";

export class OrderCreatorDetails {
  private readonly orderCreator: OrderCreator;
  private readonly creatorId?: UUID;

  constructor(params: { orderCreator: OrderCreator; creatorId?: UUID }) {
    const { orderCreator, creatorId } = params;
    this.orderCreator = OrderCreator.clone(orderCreator);
    this.creatorId = creatorId ? UUID.clone(creatorId) : undefined;
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
  getCreatorId() {
    return this.creatorId;
  }

  toPrimitives() {
    return {
      creator: this.orderCreator.getValue(),
      creatorId: this.creatorId ? this.creatorId.getValue() : undefined,
    };
  }
}
