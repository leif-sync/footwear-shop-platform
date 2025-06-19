import { Integer } from "../../shared/domain/integer.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { NotEnoughStockError } from "./errors/notEnoughStockError.js";

export class VariantSizesUpdater {
  private readonly sizeValue: PositiveInteger;
  private initialStock: NonNegativeInteger;
  private stockAdjustment: Integer;

  constructor(params: {
    sizeValue: PositiveInteger;
    initialStock: NonNegativeInteger;
    stockAdjustment?: Integer;
  }) {
    const { sizeValue, initialStock, stockAdjustment } = params;
    this.sizeValue = PositiveInteger.clone(sizeValue);
    this.initialStock = NonNegativeInteger.clone(initialStock);
    this.stockAdjustment = stockAdjustment
      ? Integer.clone(stockAdjustment)
      : new Integer(0);
  }

  static clone(size: VariantSizesUpdater) {
    return new VariantSizesUpdater({
      sizeValue: size.sizeValue,
      initialStock: size.initialStock,
      stockAdjustment: size.stockAdjustment,
    });
  }

  toPrimitives() {
    return {
      sizeValue: this.sizeValue.getValue(),
      initialStock: this.initialStock.getValue(),
      currentStock: this.getCurrentStock(),
      stockAdjustment: this.stockAdjustment.getValue(),
    };
  }

  hasEnoughStock(params: { stockToCheck: PositiveInteger }) {
    const { stockToCheck } = params;
    const currentStock = this.getCurrentStock();
    return currentStock >= stockToCheck.getValue();
  }

  /**
   * @description Subtracts stock from the variant size.
   * @param params.stockToSubtract - The amount of stock to subtract.
   * @throws {NotEnoughStockError} - If subtracting the stock results in a negative stock value.
   */
  subtractStock(params: { stockToSubtract: PositiveInteger }): void {
    const { stockToSubtract } = params;
    const currentStock = this.getCurrentStock();
    const newStock = currentStock - stockToSubtract.getValue();
    if (newStock < 0) {
      throw new NotEnoughStockError({
        sizeValue: this.sizeValue.getValue(),
      });
    }
    const currentStockAdjustment = this.stockAdjustment.getValue();
    this.stockAdjustment = new Integer(
      currentStockAdjustment - stockToSubtract.getValue()
    );
  }

  /**
   * Adds stock to the variant size.
   * @param params.stockToAdd - The amount of stock to add.
   */
  addStock(params: { stockToAdd: PositiveInteger }) {
    const { stockToAdd } = params;
    const currentStockAdjustment = this.stockAdjustment.getValue();
    this.stockAdjustment = new Integer(
      currentStockAdjustment + stockToAdd.getValue()
    );
  }

  getSizeValue() {
    return this.sizeValue.getValue();
  }

  getCurrentStock() {
    return this.initialStock.getValue() + this.stockAdjustment.getValue();
  }
}
