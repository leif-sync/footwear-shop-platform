import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";

export class VariantSize {
  private readonly sizeValue: PositiveInteger;
  private stock: NonNegativeInteger;

  constructor(params: {
    sizeValue: PositiveInteger;
    stock: NonNegativeInteger;
  }) {
    this.sizeValue = PositiveInteger.clone(params.sizeValue);
    this.stock = NonNegativeInteger.clone(params.stock);
  }

  static clone(variantSize: VariantSize) {
    return new VariantSize({
      sizeValue: variantSize.sizeValue,
      stock: variantSize.stock,
    });
  }

  setStock(params: { newStock: NonNegativeInteger }) {
    const { newStock } = params;
    this.stock = NonNegativeInteger.clone(newStock);
  }

  addStock(params: { additionalStock: PositiveInteger }) {
    const { additionalStock } = params;
    const currentStock = this.stock.getValue();
    const additionalStockValue = additionalStock.getValue();
    this.stock = new NonNegativeInteger(currentStock + additionalStockValue);
  }

  subtractStock(params: { subtractedStock: PositiveInteger }) {
    const { subtractedStock } = params;
    const currentStock = this.stock.getValue();
    const subtractedStockValue = subtractedStock.getValue();
    if (subtractedStockValue > currentStock) {
      throw new Error("Not enough stock");
    }
    const updatedStock = currentStock - subtractedStockValue;
    this.stock = new NonNegativeInteger(updatedStock);
  }

  hasEnoughStock(params: { desiredStock: PositiveInteger }) {
    const { desiredStock } = params;
    const currentStock = this.stock.getValue();
    const desiredQuantityValue = desiredStock.getValue();
    return currentStock >= desiredQuantityValue;
  }

  getSizeValue() {
    return this.sizeValue.getValue();
  }

  getStock() {
    return this.stock.getValue();
  }

  toPrimitives() {
    const sizeValue = this.sizeValue.getValue();
    const stock = this.stock.getValue();
    return { sizeValue, stock };
  }
}
