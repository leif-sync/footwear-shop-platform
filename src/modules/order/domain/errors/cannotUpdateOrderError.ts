import { UUID } from "../../../shared/domain/UUID.js";

export class CannotUpdateOrderError extends Error {
  constructor(params: { orderId: string | UUID; reason: string }) {
    const { orderId, reason } = params;
    const id = orderId instanceof UUID ? orderId.getValue() : orderId;
    super(`Cannot update order ${id}: ${reason}`);
  }
}
