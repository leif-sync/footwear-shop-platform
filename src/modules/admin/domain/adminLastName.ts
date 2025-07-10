export class AdminLastNameError extends Error {
  constructor(params: { lastName: string }) {
    super(
      `Last name "${params.lastName}" must be between ${AdminLastName.minLength} and ${AdminLastName.maxLength}
       characters long, but it is ${params.lastName.length} characters long.`
    );
  }
}
/**
 * Represents the last name of an admin.
 * This class encapsulates the logic for validating the last name according to predefined constraints.
 * It ensures that the last name meets the minimum and maximum length requirements.
 */
export class AdminLastName {
  static readonly minLength = 2;
  static readonly maxLength = 50;
  private readonly lastName: string;

  constructor(lastName: string) {
    this.lastName = lastName;
    this.ensureIsValid(lastName);
  }

  private ensureIsValid(lastName: string): void {
    const lastNameLength = lastName.length;
    const isLastNameTooShort = lastNameLength < AdminLastName.minLength;
    const isLastNameTooLong = lastNameLength > AdminLastName.maxLength;
    if (isLastNameTooShort || isLastNameTooLong) {
      throw new AdminLastNameError({ lastName });
    }
  }

  getValue(): string {
    return this.lastName;
  }

  static clone(lastName: AdminLastName): AdminLastName {
    return new AdminLastName(lastName.getValue());
  }
}
