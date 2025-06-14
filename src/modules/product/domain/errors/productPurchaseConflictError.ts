import { UUID } from "../../../shared/domain/UUID.js";

export class ProductPurchaseConflictError extends Error {
  constructor(params: { productId: string | UUID }) {
    const { productId } = params;
    const id = productId instanceof UUID ? productId.getValue() : productId;
    super(
      `Cannot delete product. It has been purchased by a customer. Product ID: ${id}`
    );
  }
}
