export class SizeAlreadyExistsError extends Error {
  constructor(params: { sizeValue: number }) {
    super(`Size with value ${params.sizeValue} already exists`);
  }
}
