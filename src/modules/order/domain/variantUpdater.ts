import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { SizeNotAvailableForVariantError } from "./errors/sizeNotAvailableForVariantError.js";
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
    if (!size) {
      throw new SizeNotAvailableForVariantError({
        sizeValue: sizeValue.getValue(),
        variantId: this.variantId.getValue(),
      });
    }
    size.addStock({ stockToAdd });
  }

  /**
   * Subtracts stock for a specific size of the variant.
   * @param params.sizeValue - The size value for which to subtract stock.
   * @param params.stockToSubtract - The amount of stock to subtract.
   * @throws {SizeNotAvailableForVariantError} - If the size is not available for the variant.
   * @throws {NotEnoughStockError} - If there is not enough stock to subtract.
   */
  subtractStockForSize(params: {
    sizeValue: PositiveInteger;
    stockToSubtract: PositiveInteger;
  }) {
    const { sizeValue, stockToSubtract } = params;
    const size = this.sizes.get(sizeValue.getValue());
    if (!size) {
      throw new SizeNotAvailableForVariantError({
        sizeValue: sizeValue.getValue(),
        variantId: this.variantId.getValue(),
      });
    }
    size.subtractStock({ stockToSubtract });
  }

  toPrimitives() {
    return {
      variantId: this.variantId.getValue(),
      sizes: Array.from(this.sizes.values()).map((size) => size.toPrimitives()),
    };
  }
}
