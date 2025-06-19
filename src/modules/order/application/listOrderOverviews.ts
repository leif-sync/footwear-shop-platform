import { PrimitiveOrderOverview } from "../domain/orderOverview.js";
import {
  OrderRepository,
  PaginatedOrderFilterCriteria,
} from "../domain/orderRepository.js";

/**
 * Class to list order overviews based on pagination and filter criteria.
 */
export class ListOrderOverviews {
  private readonly orderRepository: OrderRepository;

  constructor(params: { orderRepository: OrderRepository }) {
    this.orderRepository = params.orderRepository;
  }

  /**
   * Lists order overviews based on the provided pagination and filter criteria.
   * @param params Object containing pagination and filter criteria, see {@link PaginatedOrderFilterCriteria}.
   * @returns A promise that resolves to an array of primitive order overviews, see {@link PrimitiveOrderOverview}.
   */
  async run(
    params: PaginatedOrderFilterCriteria
  ): Promise<PrimitiveOrderOverview[]> {
    const orders = await this.orderRepository.listOrderOverviews(params);
    return orders.map((order) => order.toPrimitives());
  }
}
