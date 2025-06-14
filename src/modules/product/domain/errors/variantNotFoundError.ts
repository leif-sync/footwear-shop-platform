import { UUID } from "../../../shared/domain/UUID.js";

export class VariantNotFoundError extends Error {
  constructor(params: { variantId: string | UUID }) {
    const { variantId } = params;
    const id = variantId instanceof UUID ? variantId.getValue() : variantId;
    super(`Variant with id ${id} not found`);
  }
}
