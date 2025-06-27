export enum DiscountOptions {
  PERCENT = "PERCENT",
  FIXED = "FIXED",
  NONE = "NONE",
}

export class DiscountType {
  private readonly value: DiscountOptions;

  constructor(value: DiscountOptions) {
    this.value = value;
  }

  static create = {
    percent: () => new DiscountType(DiscountOptions.PERCENT),
    fixed: () => new DiscountType(DiscountOptions.FIXED),
    none: () => new DiscountType(DiscountOptions.NONE),
  };

  static clone(discountType: DiscountType) {
    return new DiscountType(discountType.getValue());
  }

  getValue() {
    return this.value;
  }

  equals(discountType: DiscountType | DiscountOptions) {
    if (discountType instanceof DiscountType)
      return this.value === discountType.getValue();

    return this.value === discountType;
  }
}
