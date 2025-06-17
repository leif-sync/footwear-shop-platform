import { UUID } from "../../shared/domain/UUID.js";
import { OrderNotFoundError } from "../domain/errors/orderNotFoundError.js";
import { OrderRepository } from "../domain/orderRepository.js";

export class GetOrder {
  private readonly orderRepository: OrderRepository;

  constructor(params: { orderRepository: OrderRepository }) {
    this.orderRepository = params.orderRepository;
  }

  /**
   * Retrieves an order by its ID.
   * @param params - The parameters for retrieving the order.
   * @param params.orderId - The ID of the order to retrieve.
   * @returns The order represented as a primitive object.
   * @throws {OrderNotFoundError} If the order with the given ID does not exist.
   */
  async run(params: { orderId: UUID }) {
    const { orderId } = params;

    const order = await this.orderRepository.find({
      orderId,
    });

    if (!order) throw new OrderNotFoundError({ orderId });

    return order.toPrimitives();
  }
}
