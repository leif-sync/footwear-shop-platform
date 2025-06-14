import { UUID } from "../../../shared/domain/UUID.js";

export class NotEnoughStockError extends Error {
  constructor(params: { variantId: UUID | string; sizeValue: number }) {
    const { sizeValue, variantId } = params;
    const id = variantId instanceof UUID ? variantId.getValue() : variantId;

    super(`Not enough stock for variant with id ${id} and size ${sizeValue}`);
  }
}
