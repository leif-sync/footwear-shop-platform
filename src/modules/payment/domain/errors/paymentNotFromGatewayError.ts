import { UUID } from "../../../shared/domain/UUID.js";

export class PaymentNotFromGatewayError extends Error {
  constructor(params: { paymentId: UUID | string }) {
    const id =
      params.paymentId instanceof UUID
        ? params.paymentId.getValue()
        : params.paymentId;

    super(`Payment with ID ${id} is not from a payment gateway.`);
  }
}
