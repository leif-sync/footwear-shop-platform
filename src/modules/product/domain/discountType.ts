export const discountOptions = {
  PERCENT: "PERCENT",
  FIXED: "FIXED",
  NONE: "NONE",
} as const;

export type discountOptions = keyof typeof discountOptions;
const validDiscountTypes = new Set(Object.keys(discountOptions));

export class DiscountType {
  private readonly value: discountOptions;

  constructor(value: discountOptions) {
    this.value = value;
    this.ensureIsValid();
  }

  static create = {
    percent: () => new DiscountType(discountOptions.PERCENT),
    fixed: () => new DiscountType(discountOptions.FIXED),
    none: () => new DiscountType(discountOptions.NONE),
  };

  static clone(discountType: DiscountType) {
    return new DiscountType(discountType.getValue());
  }

  private ensureIsValid() {
    if (!validDiscountTypes.has(this.value))
      throw new Error("Invalid discount type");
  }

  getValue() {
    return this.value;
  }

  equals(discountType: DiscountType | discountOptions) {
    if (discountType instanceof DiscountType)
      return this.value === discountType.getValue();

    return this.value === discountType;
  }
}
