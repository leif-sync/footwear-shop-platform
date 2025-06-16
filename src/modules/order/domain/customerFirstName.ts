export class CustomerFirsNameError extends Error {
  constructor(params: { minLength: number });
  constructor(params: { maxLength: number });
  constructor(params: { onlyAlphabetic: boolean });

  constructor(
    params:
      | { minLength: number }
      | { maxLength: number }
      | { onlyAlphabetic: boolean }
  ) {
    if ("minLength" in params) {
      super(`First name must be at least ${params.minLength} characters long.`);
      return;
    }
    if ("maxLength" in params) {
      super(`First name must be at most ${params.maxLength} characters long.`);
      return;
    }
    super(`First name must contain only alphabetic characters.`);
  }
}

export class CustomerFirstName {
  static maxLength = 50;
  static minLength = 1;

  private readonly firstName: string;

  constructor(firstName: string) {
    this.firstName = firstName;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.firstName.length < CustomerFirstName.minLength) {
      throw new CustomerFirsNameError({
        minLength: CustomerFirstName.minLength,
      });
    }

    if (this.firstName.length > CustomerFirstName.maxLength) {
      throw new CustomerFirsNameError({
        maxLength: CustomerFirstName.maxLength,
      });
    }

    if (!/^[a-zA-Z]+$/.test(this.firstName)) {
      throw new CustomerFirsNameError({ onlyAlphabetic: true });
    }
  }

  static clone(customerFirstName: CustomerFirstName): CustomerFirstName {
    return new CustomerFirstName(customerFirstName.firstName);
  }

  getValue() {
    return this.firstName;
  }
}
