import { PositiveInteger } from "../../shared/domain/positiveInteger.js";

export class OrderVariantSize {
  private readonly sizeValue: PositiveInteger;
  private readonly quantity: PositiveInteger;

  constructor(params: {
    sizeValue: PositiveInteger;
    quantity: PositiveInteger;
  }) {
    this.sizeValue = PositiveInteger.clone(params.sizeValue);
    this.quantity = PositiveInteger.clone(params.quantity);
  }

  static clone(orderVariantSize: OrderVariantSize): OrderVariantSize {
    return new OrderVariantSize({
      sizeValue: orderVariantSize.sizeValue,
      quantity: orderVariantSize.quantity,
    });
  }

  getSizeValue() {
    return this.sizeValue.getValue();
  }

  getQuantity() {
    return this.quantity.getValue();
  }

  toPrimitives() {
    return {
      sizeValue: this.sizeValue.getValue(),
      quantity: this.quantity.getValue(),
    };
  }
}
