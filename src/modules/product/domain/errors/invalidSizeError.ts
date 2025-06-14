export class InvalidSizeError extends Error {
  constructor(params: { sizeValue: number }) {
    const { sizeValue } = params;
    super(`Size with value ${sizeValue} is invalid`);
  }
}