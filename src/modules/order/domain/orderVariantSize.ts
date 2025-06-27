import { PositiveInteger } from "../../shared/domain/positiveInteger.js";

export interface PrimitiveOrderVariantSize {
  sizeValue: number;
  quantity: number;
}

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

  toPrimitives(): PrimitiveOrderVariantSize {
    return {
      sizeValue: this.sizeValue.getValue(),
      quantity: this.quantity.getValue(),
    };
  }

  static from(primitive: PrimitiveOrderVariantSize): OrderVariantSize {
    return new OrderVariantSize({
      sizeValue: new PositiveInteger(primitive.sizeValue),
      quantity: new PositiveInteger(primitive.quantity),
    });
  }
}
