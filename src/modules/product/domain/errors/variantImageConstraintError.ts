import { UUID } from "../../../shared/domain/UUID.js";
import { variantConstraint } from "../variantConstraints.js";

const maxImageAllowed = variantConstraint.image.maxImages;
const minImageAllowed = variantConstraint.image.minImages;

//TODO: mover el constraint a domain
export class VariantImageConstraintError extends Error {
  constructor(params: { variantId: UUID | string }) {
    const { variantId } = params;
    const id = variantId instanceof UUID ? variantId.getValue() : variantId;

    super(
      `The variant with id ${id} must have at least ${minImageAllowed} and at most ${maxImageAllowed} images.`
    );
  }
}
