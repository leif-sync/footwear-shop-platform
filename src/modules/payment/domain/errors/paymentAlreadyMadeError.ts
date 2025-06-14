import { UUID } from "../../../shared/domain/UUID.js";

export class PaymentAlreadyMadeError extends Error {
  constructor(params: { orderId: string | UUID }) {
    const id =
      params.orderId instanceof UUID
        ? params.orderId.getValue()
        : params.orderId;

    super(`Payment already made for order with ID: ${id}`);
  }
}
