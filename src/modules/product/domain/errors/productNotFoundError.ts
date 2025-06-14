import { UUID } from "../../../shared/domain/UUID.js";

export class ProductNotFoundError extends Error {
  constructor(params: { productId: string | UUID }) {
    const { productId } = params;
    const id = productId instanceof UUID ? productId.getValue() : productId;
    super(`Product with id ${id} not found`);
  }
}
