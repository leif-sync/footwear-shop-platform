export class IntegerError extends Error {
  constructor(params: { invalidNumber: number }) {
    super(`Invalid integer: ${params.invalidNumber}`);
  }
}

export class Integer {
  private readonly value: number;
  constructor(value: number) {
    const valueToValidate = Number(value);
    if (!Number.isInteger(valueToValidate)) {
      throw new IntegerError({ invalidNumber: valueToValidate });
    }

    this.value = valueToValidate;
  }

  getValue() {
    return this.value;
  }

  static clone(value: Integer) {
    return new Integer(value.getValue());
  }

  equals(value: Integer | number) {
    const numberValue = value instanceof Integer ? value.getValue() : value;
    return this.value === numberValue;
  }
}
