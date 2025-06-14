import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Size } from "./size.js";

export abstract class SizeRepository {
  abstract list(params: {
    limit: PositiveInteger;
    offset: NonNegativeInteger;
  }): Promise<Size[]>;

  abstract countSizes(): Promise<NonNegativeInteger>;

  abstract create(params: { size: Size }): Promise<void>;

  abstract retrieveSizesByValue(
    sizeValue: PositiveInteger | PositiveInteger[]
  ): Promise<Size[]>;

  abstract find(params: { sizeId: UUID }): Promise<Size | null>;
  abstract find(params: { sizeValue: PositiveInteger }): Promise<Size | null>;

  abstract delete(params: { sizeId: UUID }): Promise<void>;
  abstract delete(params: { sizeValue: PositiveInteger }): Promise<void>;
}
