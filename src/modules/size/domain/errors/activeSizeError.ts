export class ActiveSizeError extends Error {
  constructor(params: { sizeValue: number }) {
    super(`Size with value ${params.sizeValue} is in use`);
  }
}
