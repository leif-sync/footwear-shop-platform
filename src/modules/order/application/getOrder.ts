import { OrderNotFoundError } from "../domain/errors/orderNotFoundError.js";
import { PrimitiveOrderFull } from "../domain/orderFull.js";
import {
  OrderRepository,
  OrderSearchOptions,
} from "../domain/orderRepository.js";

/**
 * Use case for retrieving an order.
 */
export class GetOrder {
  private readonly orderRepository: OrderRepository;

  constructor(params: { orderRepository: OrderRepository }) {
    this.orderRepository = params.orderRepository;
  }

  /**
   * Executes the use case to retrieve an order.
   * @param params - Parameters for searching the order, see {@link OrderSearchOptions} for details.
   * @returns A promise that resolves to the full order details as a {@link PrimitiveOrderFull} object.
   * @throws {OrderNotFoundError} If the order is not found.
   */
  async run(params: OrderSearchOptions): Promise<PrimitiveOrderFull> {
    const { orderId } = params;
    const order = await this.orderRepository.find(params);
    if (!order) throw new OrderNotFoundError({ orderId });
    return order.toPrimitives();
  }
}
