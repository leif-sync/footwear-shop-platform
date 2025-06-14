import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";

export class Size {
  private readonly sizeId: UUID;
  private readonly sizeValue: PositiveInteger;

  constructor(params: { sizeId: UUID; sizeValue: PositiveInteger }) {
    this.sizeId = params.sizeId;
    this.sizeValue = params.sizeValue;
  }

  getId() {
    return this.sizeId.getValue();
  } 

  getSizeValue() {
    return this.sizeValue.getValue();
  }

  toPrimitives() {
    return {
      sizeId: this.sizeId.getValue(),
      sizeValue: this.sizeValue.getValue(),
    };
  }

  static clone(size: Size) {
    return new Size({
      sizeId: new UUID(size.getId()),
      sizeValue: new PositiveInteger(size.getSizeValue()),
    });
  }
}
