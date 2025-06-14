export class NonNegativeError extends Error {
  constructor(params: { invalidNumber: number }) {
    super(`Invalid non-negative integer: ${params.invalidNumber}`);
  }
}

export class NonNegativeInteger {
  private readonly value: number;

  constructor(value: number) {
    const valueToValidate = Number(value);
    this.value = valueToValidate;
    this.ensureIsValid(valueToValidate);
  }

  private ensureIsValid(value: number) {
    if (value < 0) {
      throw new NonNegativeError({ invalidNumber: value });
    }

    if (!Number.isInteger(value)) {
      throw new NonNegativeError({ invalidNumber: value });
    }
  }

  static clone(toClone: NonNegativeInteger) {
    return new NonNegativeInteger(toClone.getValue());
  }

  getValue() {
    return this.value;
  }

  equals(other: NonNegativeInteger | number): boolean {
    if (other instanceof NonNegativeInteger)
      return this.value === other.getValue();

    return this.value === other;
  }
}
