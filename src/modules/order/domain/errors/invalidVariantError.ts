import { UUID } from "../../../shared/domain/UUID.js";

export class InvalidVariantError extends Error {
  constructor(params: { variantId: string | UUID }) {
    const { variantId } = params;

    if (variantId instanceof UUID) {
      super(`Variant with id ${variantId.getValue()} does not exist`);
      return;
    }

    super(`Variant with id ${variantId} does not exist`);
  }
}
