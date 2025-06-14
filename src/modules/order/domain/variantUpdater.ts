import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { VariantSizesUpdater } from "./variantSizesUpdater.js";

type sizeValue = number;
export class VariantUpdater {
  private readonly variantId: UUID;
  private readonly sizes = new Map<sizeValue, VariantSizesUpdater>();

  constructor(params: { variantId: UUID; sizes: VariantSizesUpdater[] }) {
    const { variantId } = params;
    this.variantId = UUID.clone(variantId);
    params.sizes.forEach((size) => {
      const sizeValue = size.getSizeValue();
      const isSizePresent = this.sizes.has(sizeValue);
      if (isSizePresent) throw new Error("Size already present");
      this.sizes.set(sizeValue, VariantSizesUpdater.clone(size));
    });
  }

  static clone(variant: VariantUpdater) {
    // el constructor se encarga de las copias profundas
    return new VariantUpdater({
      variantId: variant.variantId,
      sizes: Array.from(variant.sizes.values()),
    });
  }

  getVariantId() {
    return this.variantId.getValue();
  }

  hasSize(params: { sizeValue: PositiveInteger }) {
    return this.sizes.has(params.sizeValue.getValue());
  }

  hasEnoughStockForSize(params: {
    sizeValue: PositiveInteger;
    stockToCheck: PositiveInteger;
  }) {
    const { sizeValue, stockToCheck } = params;
    const size = this.sizes.get(sizeValue.getValue());
    if (!size) return false;
    return size.hasEnoughStock({ stockToCheck });
  }

  addStockForSize(params: {
    sizeValue: PositiveInteger;
    stockToAdd: PositiveInteger;
  }) {
    const { sizeValue, stockToAdd } = params;
    const size = this.sizes.get(sizeValue.getValue());
    if (!size) throw new Error("Size not present");
    size.addStock({ stockToAdd });
  }

  subtractStockForSize(params: {
    sizeValue: PositiveInteger;
    stockToSubtract: PositiveInteger;
  }) {
    const { sizeValue, stockToSubtract } = params;
    const size = this.sizes.get(sizeValue.getValue());
    if (!size) throw new Error("Size not present");
    size.subtractStock({ stockToSubtract });
  }

  toPrimitives() {
    return {
      variantId: this.variantId.getValue(),
      sizes: Array.from(this.sizes.values()).map((size) => size.toPrimitives()),
    };
  }
}
