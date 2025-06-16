export class NotEnoughStockError extends Error {
  constructor(params: { sizeValue: number }) {
    const { sizeValue } = params;
    super(`Not enough stock for size ${sizeValue}`);
  }
}
