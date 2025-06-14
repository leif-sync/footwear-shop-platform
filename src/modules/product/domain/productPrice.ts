import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { discountOptions, DiscountType } from "./discountType.js";

export class ProductPrice {
  private readonly baseValue: PositiveInteger;
  private readonly discountType: DiscountType;
  private readonly discountValue: NonNegativeInteger;
  private readonly discountStartAt: Date | null;
  private readonly discountEndAt: Date | null;

  constructor(params: {
    baseValue: PositiveInteger;
    discountType: DiscountType;
    discountValue: NonNegativeInteger;
    discountStartAt: Date | null;
    discountEndAt: Date | null;
  }) {
    const { discountStartAt, discountEndAt } = params;
    this.baseValue = PositiveInteger.clone(params.baseValue);
    this.discountType = DiscountType.clone(params.discountType);
    this.discountValue = NonNegativeInteger.clone(params.discountValue);
    this.discountStartAt = discountStartAt ? new Date(discountStartAt) : null;
    this.discountEndAt = discountEndAt ? new Date(discountEndAt) : null;

    this.ensureDiscountIsValid();
  }

  static clone(price: ProductPrice) {
    return new ProductPrice({
      baseValue: price.baseValue,
      discountType: price.discountType,
      discountValue: price.discountValue,
      discountStartAt: price.discountStartAt,
      discountEndAt: price.discountEndAt,
    });
  }

  private ensureDiscountIsValid() {
    if (this.discountType.equals(DiscountType.create.none())) {
      if (this.discountValue.getValue() !== 0)
        throw new Error("Discount value must be 0 when there is no discount");

      if (this.discountStartAt || this.discountEndAt)
        throw new Error(
          "Discount dates must be null when there is no discount"
        );

      return;
    }

    if (!this.discountStartAt || !this.discountEndAt)
      throw new Error("Discount start and end dates must be provided");

    if (this.discountStartAt > this.discountEndAt)
      throw new Error("Discount start date must be before the end date");

    if (
      this.discountType.equals(discountOptions.PERCENT) &&
      this.discountValue.getValue() > 100
    ) {
      throw new Error("Discount value must be less than 100%");
    }

    if (
      this.discountType.equals(discountOptions.FIXED) &&
      this.discountValue.getValue() > this.baseValue.getValue()
    ) {
      throw new Error("Discount value must be less than the base value");
    }
  }

  evaluateFinalCost(): number {
    if (this.discountType.equals(discountOptions.NONE))
      return this.baseValue.getValue();

    if (!this.discountStartAt || !this.discountEndAt)
      throw new Error("Discount start and end dates must be provided");

    if (this.discountStartAt > new Date()) return this.baseValue.getValue();
    if (this.discountEndAt < new Date()) return this.baseValue.getValue();

    if (this.discountType.equals(discountOptions.PERCENT)) {
      return (
        this.baseValue.getValue() -
        this.baseValue.getValue() * (this.discountValue.getValue() / 100)
      );
    }

    return this.baseValue.getValue() - this.discountValue.getValue();
  }

  toPrimitives() {
    return {
      baseValue: this.baseValue.getValue(),
      discountType: this.discountType.getValue(),
      discountValue: this.discountValue.getValue(),
      discountStartAt: this.discountStartAt,
      discountEndAt: this.discountEndAt,
    };
  }
}
