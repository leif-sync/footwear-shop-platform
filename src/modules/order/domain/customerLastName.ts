export class CustomerLastNameError extends Error {
  constructor(
    params:
      | { minLength: number }
      | { maxLength: number }
      | { onlyAlphabetic: boolean }
  ) {
    if ("minLength" in params) {
      super(`Last name must be at least ${params.minLength} characters long.`);
      return;
    }
    if ("maxLength" in params) {
      super(`Last name must be at most ${params.maxLength} characters long.`);
      return;
    }
    super(`Last name must contain only alphabetic characters.`);
  }
}

export class CustomerLastName {
  static maxLength = 50;
  static minLength = 1;

  private readonly lastName: string;

  constructor(lastName: string) {
    this.lastName = lastName;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.lastName.length < CustomerLastName.minLength) {
      throw new CustomerLastNameError({
        minLength: CustomerLastName.minLength,
      });
    }

    if (this.lastName.length > CustomerLastName.maxLength) {
      throw new CustomerLastNameError({
        maxLength: CustomerLastName.maxLength,
      });
    }

    if (!/^[a-zA-Z]+$/.test(this.lastName)) {
      throw new CustomerLastNameError({ onlyAlphabetic: true });
    }
  }

  static clone(customerLastName: CustomerLastName): CustomerLastName {
    return new CustomerLastName(customerLastName.lastName);
  }

  clone() {
    return CustomerLastName.clone(this);
  }

  getValue() {
    return this.lastName;
  }
}
