import { UUID } from "../../../shared/domain/UUID.js";

export class OrderNotFoundError extends Error {
  constructor(params: { orderId: string | UUID }) {
    const { orderId } = params;
    const id = orderId instanceof UUID ? orderId.getValue() : orderId;
    super(`Order with id ${id} not found`);
  }
}
