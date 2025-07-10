export class AdminFirstNameError extends Error {
  constructor(params: { firstName: string }) {
    super(
      `First name "${params.firstName}" must be between ${AdminFirstName.minLength} and ${AdminFirstName.maxLength}
       characters long, but it is ${params.firstName.length} characters long.`
    );
  }
}

/**
 * Represents the first name of an admin.
 * This class encapsulates the logic for validating the first name according to predefined constraints.
 * It ensures that the first name meets the minimum and maximum length requirements.
 */
export class AdminFirstName {
  static readonly minLength = 2;
  static readonly maxLength = 50;
  private readonly firstName: string;

  constructor(firstName: string) {
    this.firstName = firstName;
    this.ensureIsValid(firstName);
  }

  private ensureIsValid(firstName: string): void {
    const firstNameLength = firstName.length;

    const isFirstNameTooShort = firstNameLength < AdminFirstName.minLength;
    const isFirstNameTooLong = firstNameLength > AdminFirstName.maxLength;

    if (isFirstNameTooShort || isFirstNameTooLong) {
      throw new AdminFirstNameError({ firstName });
    }
  }

  getValue(): string {
    return this.firstName;
  }

  static clone(firstName: AdminFirstName): AdminFirstName {
    return new AdminFirstName(firstName.getValue());
  }
}
