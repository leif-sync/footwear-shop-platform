import { UUID } from "../../../shared/domain/UUID.js";
import { VariantFull } from "../variantFull.js";

export class VariantImageConstraintError extends Error {
  constructor(params: { variantId: UUID | string }) {
    const { variantId } = params;
    const id = variantId instanceof UUID ? variantId.getValue() : variantId;

    super(
      `The variant with id ${id} must have at least ${VariantFull.imageConstraint.minImages} and at most ${VariantFull.imageConstraint.maxImages} images.`
    );
  }
}
