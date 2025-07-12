import { EmailAddress } from "../../shared/domain/emailAddress.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { OrderCreator } from "./orderCreator.js";
import { OrderFull } from "./orderFull.js";
import { OrderOverview } from "./orderOverview.js";
import { OrderPaymentStatus } from "./orderPaymentStatus.js";
import { OrderStatus } from "./orderStatus.js";
import { OrderWrite } from "./orderWrite.js";

/**
 * Interface for defining order filter criteria.
 */
export interface OrderFilterCriteria {
  /**
   * Optional filter for order status. Can be a single status or an array of statuses.
   */
  orderStatus?: OrderStatus | OrderStatus[];
  /**
   * Optional filter for payment status. Can be a single status or an array of statuses.
   */
  paymentStatus?: OrderPaymentStatus | OrderPaymentStatus[];
  /**
   * Optional filter for customer email. Can be a single email or an array of emails.
   */
  customerEmail?: EmailAddress | EmailAddress[];
  /**
   * Optional filter for order creator. Can be a single creator or an array of creators.
   */
  creator?: OrderCreator | OrderCreator[];
}

/**
 * Interface for defining paginated order filter criteria, extending OrderFilterCriteria.
 */
export interface PaginatedOrderFilterCriteria extends OrderFilterCriteria {
  /**
   * Maximum number of results to return.
   */
  limit: PositiveInteger;
  /**
   * Number of results to skip from the beginning.
   */
  offset: NonNegativeInteger;
}

/**
 * Interface for defining order search options.
 */
export interface OrderSearchOptions {
  /**
   * ID of the order to search for.
   */
  orderId: UUID;
}

export abstract class OrderRepository {
  abstract listOrderOverviews(
    params: PaginatedOrderFilterCriteria
  ): Promise<OrderOverview[]>;

  abstract find(params: OrderSearchOptions): Promise<OrderFull | null>;

  abstract create(params: { order: OrderWrite }): Promise<void>;

  abstract update(params: { order: OrderWrite }): Promise<void>;

  abstract listAllOrders(params: OrderFilterCriteria): Promise<OrderWrite[]>;

  abstract delete(params: { orderId: UUID | UUID[] }): Promise<void>;

  abstract countStoredOrders(
    params: OrderFilterCriteria
  ): Promise<NonNegativeInteger>;

  abstract checkIfProductIsBought(params: {
    productId: UUID;
  }): Promise<boolean>;

  abstract checkIfVariantIsBought(params: {
    productId: UUID;
    variantId: UUID;
  }): Promise<boolean>;

  abstract checkIfOrderExists(params: OrderSearchOptions): Promise<boolean>;
}
