import { UUID } from "../../../shared/domain/UUID.js";

export class PaymentTransactionNotFoundError extends Error {
  constructor(params: { transactionId: string | UUID }) {
    const { transactionId } = params;
    const id =
      transactionId instanceof UUID ? transactionId.getValue() : transactionId;
    super(`Payment transaction with id ${id} not found`);
  }
}
