import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { InvalidVariantError } from "./errors/invalidVariantError.js";
import { VariantUpdater } from "./variantUpdater.js";

type variantId = string;
export class ProductUpdater {
  private readonly productId: UUID;
  private readonly unitPrice: PositiveInteger;
  private readonly variants = new Map<variantId, VariantUpdater>();

  constructor(params: {
    productId: UUID;
    unitPrice: PositiveInteger;
    variants: VariantUpdater[];
  }) {
    const { productId, unitPrice } = params;
    this.productId = UUID.clone(productId);
    this.unitPrice = PositiveInteger.clone(unitPrice);
    params.variants.forEach((variant) => {
      const variantId = variant.getVariantId();
      const isVariantPresent = this.variants.has(variantId);
      if (isVariantPresent) throw new Error("Variant already present");
      this.variants.set(variantId, VariantUpdater.clone(variant));
    });
  }

  getProductId() {
    return this.productId.getValue();
  }

  getUnitPrice() {
    return this.unitPrice.getValue();
  }

  hasVariant(params: { variantId: UUID }) {
    return this.variants.has(params.variantId.getValue());
  }

  hasEnoughStockForVariant(params: {
    variantId: UUID;
    sizeValue: PositiveInteger;
    stockToCheck: PositiveInteger;
  }) {
    const { variantId, sizeValue, stockToCheck } = params;
    const variant = this.variants.get(variantId.getValue());
    if (!variant) throw new InvalidVariantError({ variantId });
    return variant.hasEnoughStockForSize({ sizeValue, stockToCheck });
  }

  addStockForVariant(params: {
    variantId: UUID;
    sizeValue: PositiveInteger;
    stockToAdd: PositiveInteger;
  }) {
    const { variantId, sizeValue, stockToAdd } = params;
    const variant = this.variants.get(variantId.getValue());
    if (!variant) throw new InvalidVariantError({ variantId });
    variant.addStockForSize({ sizeValue, stockToAdd });
  }

  /**
   * Subtracts stock for a specific variant and size.
   * @param params.variantId - The ID of the variant.
   * @param params.sizeValue - The size value for which to subtract stock.
   * @param params.stockToSubtract - The amount of stock to subtract.
   * @throws {InvalidVariantError} - If the variant with the given ID does not exist.
   * @throws {SizeNotAvailableForVariantError} - If the size is not available for the variant.
   * @throws {NotEnoughStockError} - If there is not enough stock to subtract for the specified size.
   */
  subtractStockForVariant(params: {
    variantId: UUID;
    sizeValue: PositiveInteger;
    stockToSubtract: PositiveInteger;
  }): void {
    const { variantId, sizeValue, stockToSubtract } = params;
    const variant = this.variants.get(variantId.getValue());
    if (!variant) throw new InvalidVariantError({ variantId });
    variant.subtractStockForSize({ sizeValue, stockToSubtract });
  }

  hasSizeForVariant(params: { variantId: UUID; sizeValue: PositiveInteger }) {
    const { variantId, sizeValue } = params;
    const variant = this.variants.get(variantId.getValue());
    if (!variant) throw new InvalidVariantError({ variantId });
    return variant.hasSize({ sizeValue });
  }

  toPrimitives() {
    return {
      productId: this.productId.getValue(),
      unitPrice: this.unitPrice.getValue(),
      variants: Array.from(this.variants.values()).map((variant) =>
        variant.toPrimitives()
      ),
    };
  }
}
