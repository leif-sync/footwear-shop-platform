import { UUID } from "../../../shared/domain/UUID.js";

export class InvalidOrderError extends Error {
  constructor(params: { orderId: string | UUID }) {
    const { orderId } = params;
    const id = orderId instanceof UUID ? orderId.getValue() : orderId;
    super(`Invalid order with id ${id}`);
  }
}
