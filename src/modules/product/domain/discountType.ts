export enum DiscountOptions {
  PERCENT = "PERCENT",
  FIXED = "FIXED",
  NONE = "NONE",
}

export class DiscountTypeError extends Error {
  constructor(params: { invalidDiscountType: string }) {
    const { invalidDiscountType } = params;
    super(`Invalid discount type: ${invalidDiscountType}`);
  }
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

  static from(value: string): DiscountType {
    const validDiscounts = Object.values(DiscountOptions);
    const isValid = validDiscounts.includes(value as DiscountOptions);
    if (!isValid) {
      throw new DiscountTypeError({ invalidDiscountType: value });
    }
    return new DiscountType(value as DiscountOptions);
  }
}
