import { UUID } from "../../shared/domain/UUID.js";
import { OrderNotFoundError } from "../domain/errors/orderNotFoundError.js";
import { OrderRepository } from "../domain/orderRepository.js";

export class GetOrder {
  private readonly orderRepository: OrderRepository;

  constructor(params: { orderRepository: OrderRepository }) {
    this.orderRepository = params.orderRepository;
  }

  async run(params: { orderId: string }) {
    const orderId = new UUID(params.orderId);

    const order = await this.orderRepository.find({
      orderId,
    });

    if (!order) throw new OrderNotFoundError({ orderId });

    return order.toPrimitives();
  }
}
