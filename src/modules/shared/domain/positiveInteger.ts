export class PositiveIntegerError extends Error {
  constructor(params: { invalidNumber: number }) {
    super(`Invalid positive integer: ${params.invalidNumber}`);
  }
}

export class PositiveInteger {
  private readonly value: number;

  constructor(value: number) {
    const valueToValidate = Number(value);

    if (valueToValidate <= 0) {
      throw new PositiveIntegerError({ invalidNumber: valueToValidate });
    }

    if (!Number.isInteger(valueToValidate)) {
      throw new PositiveIntegerError({
        invalidNumber: valueToValidate,
      });
    }

    this.value = valueToValidate;
  }

  static clone(positiveInteger: PositiveInteger) {
    return new PositiveInteger(positiveInteger.getValue());
  }

  getValue() {
    return this.value;
  }

  equals(other: PositiveInteger | number): boolean {
    if (other instanceof PositiveInteger) {
      return this.value === other.getValue();
    }
    return this.value === other;
  }

  toString() {
    return this.value.toString();
  }
}
