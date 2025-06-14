import { UUID } from "../../../shared/domain/UUID.js";

export class VariantPurchaseConflictError extends Error {
  constructor(params: { productId: string | UUID; variantId: string | UUID }) {
    const productId =
      params.productId instanceof UUID
        ? params.productId.getValue()
        : params.productId;
    const variantId =
      params.variantId instanceof UUID
        ? params.variantId.getValue()
        : params.variantId;
    super(
      `Cannot delete variant. It has been purchased by a customer. Variant ID: ${variantId} from Product ID: ${productId}`
    );
  }
}
