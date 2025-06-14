import { UUID } from "../../../shared/domain/UUID.js";

export class SizeNotAvailableForVariantError extends Error {
  constructor(params: { sizeValue: number; variantId: string | UUID }) {
    const { sizeValue, variantId } = params;
    const id = variantId instanceof UUID ? variantId.getValue() : variantId;
    super(
      `Size with value ${sizeValue} is not available for variant with id ${id}`
    );
  }
}
