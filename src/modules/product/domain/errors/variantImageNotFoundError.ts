import { UUID } from "../../../shared/domain/UUID.js";

export class VariantImageNotFoundError extends Error {
  constructor(params: { imageId: string; variantId: string | UUID }) {
    const { variantId, imageId } = params;
    const id = variantId instanceof UUID ? variantId.getValue() : variantId;
    super(
      `Variant image with id ${imageId} not found in variant with id ${id}`
    );
  }
}
