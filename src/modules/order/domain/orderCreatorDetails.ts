import { UUID } from "../../shared/domain/UUID.js";
import { OrderCreator, OrderCreatorOptions } from "./orderCreator.js";

export interface PrimitiveOrderCreatorDetails {
  creator: OrderCreatorOptions;
  creatorId?: string;
}

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

  clone(): OrderCreatorDetails {
    return OrderCreatorDetails.clone(this);
  }

  getCreatorType() {
    return this.orderCreator;
  }

  getCreatorId(): UUID | undefined {
    return this.creatorId;
  }

  toPrimitives(): PrimitiveOrderCreatorDetails {
    return {
      creator: this.orderCreator.getValue(),
      creatorId: this.creatorId ? this.creatorId.getValue() : undefined,
    };
  }
}
