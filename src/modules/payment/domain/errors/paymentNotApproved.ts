import { UUID } from "../../../shared/domain/UUID.js";

export class PaymentNotApprovedError extends Error {
  constructor(params: { paymentId: string | UUID }) {
    const paymentId =
      params.paymentId instanceof UUID
        ? params.paymentId.getValue()
        : params.paymentId;
        
    super(`Payment with ID ${paymentId} is not approved.`);
  }
}
