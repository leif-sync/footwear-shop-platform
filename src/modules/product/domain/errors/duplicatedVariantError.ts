import { UUID } from "../../../shared/domain/UUID.js";

export class DuplicatedVariantError extends Error {
  constructor(params: { variantId: string | UUID }) {
    const { variantId } = params;
    const id = variantId instanceof UUID ? variantId.getValue() : variantId;
    super(`The variant with id ${id} is duplicated`);
  }
}
