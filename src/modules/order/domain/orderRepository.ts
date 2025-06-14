import { Email } from "../../shared/domain/email.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { OrderCreator } from "./orderCreator.js";
import { OrderFull } from "./orderFull.js";
import { OrderOverview } from "./orderOverview.js";
import { OrderPaymentStatus } from "./orderPaymentStatus.js";
import { OrderStatus } from "./orderStatus.js";
import { OrderWrite } from "./orderWrite.js";

export interface orderFilterCriteria {
  limit: PositiveInteger;
  offset: NonNegativeInteger;
  orderStatus?: OrderStatus | OrderStatus[];
  paymentStatus?: OrderPaymentStatus | OrderPaymentStatus[];
  customerEmail?: Email | Email[];
}

export abstract class OrderRepository {
  abstract listOrderOverviews(params: orderFilterCriteria): Promise<OrderOverview[]>;

  abstract find(params: { orderId: UUID }): Promise<OrderFull | null>;

  abstract create(params: { order: OrderWrite }): Promise<void>;

  abstract update(params: { order: OrderWrite }): Promise<void>;
  abstract update(params: { orders: OrderWrite[] }): Promise<void>;

  abstract listOrderWrites(params: {
    limit?: PositiveInteger;
    offset?: NonNegativeInteger;
    orderStatus?: OrderStatus | OrderStatus[];
    paymentStatus?: OrderPaymentStatus | OrderPaymentStatus[];
    creator?: OrderCreator | OrderCreator[];
  }): Promise<OrderWrite[]>;

  abstract delete(params: { orderId: UUID }): Promise<void>;
  abstract delete(params: { orderIds: UUID[] }): Promise<void>;

  abstract countStoredOrders(params: orderFilterCriteria): Promise<NonNegativeInteger>; // !

  abstract checkIfProductIsBought(params: {
    productId: UUID;
  }): Promise<boolean>;

  abstract checkIfVariantIsBought(params: {
    productId: UUID;
    variantId: UUID;
  }): Promise<boolean>;

  abstract checkIfOrderExists(params: {
    orderId: UUID;
  }): Promise<boolean>;
}
