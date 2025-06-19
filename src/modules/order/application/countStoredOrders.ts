import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import {
  OrderFilterCriteria,
  OrderRepository,
} from "../domain/orderRepository.js";

/**
 * Class to count stored orders based on different filters.
 */
export class CountStoredOrders {
  private orderRepository: OrderRepository;

  constructor(params: { orderRepository: OrderRepository }) {
    this.orderRepository = params.orderRepository;
  }

  /**
   * Counts stored orders based on optional filter criteria.
   *
   * @param params - Filters to apply. See {@link OrderFilterCriteria} for details.
   * @returns A Promise resolving to the number of matching stored orders.
   */
  async run(params: OrderFilterCriteria): Promise<NonNegativeInteger> {
    const storedOrdersCount =
      await this.orderRepository.countStoredOrders(params);
    return storedOrdersCount;
  }
}
