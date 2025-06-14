import { PositiveInteger } from "../../../shared/domain/positiveInteger.js";
import { UUID } from "../../../shared/domain/UUID.js";

export class SizeNotFoundError extends Error {
  constructor(params: { sizeId: string | UUID });
  constructor(params: { sizeValue: number });
  constructor(params: { sizeValue: PositiveInteger });
  constructor(params: {
    sizeValue?: number | PositiveInteger;
    sizeId?: string | UUID;
  }) {
    if (params.sizeId) {
      const sizeId =
        params.sizeId instanceof UUID
          ? params.sizeId.getValue()
          : params.sizeId;

      super(`Size with id ${sizeId} not found`);
      return;
    }
    if (params.sizeValue) {
      const sizeValue =
        params.sizeValue instanceof PositiveInteger
          ? params.sizeValue.getValue()
          : params.sizeValue;

      super(`Size with value ${sizeValue} not found`);
      return;
    }
    throw new Error("Invalid params");
  }
}
