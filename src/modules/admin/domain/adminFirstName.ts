import { adminConstraints } from "./adminConstraints.js";

/**
 * Represents the first name of an admin.
 * This class encapsulates the logic for validating the first name according to predefined constraints.
 * It ensures that the first name meets the minimum and maximum length requirements.
 */
export class AdminFirstName {
  private readonly firstName: string;

  constructor(firstName: string) {
    this.firstName = firstName;
    this.ensureIsValid(firstName);
  }

  private ensureIsValid(firstName: string): void {
    if (firstName.length < adminConstraints.firstName.minLength) {
      throw new Error(
        `First name must be at least ${adminConstraints.firstName.minLength} characters long`
      );
    }
    if (firstName.length > adminConstraints.firstName.maxLength) {
      throw new Error(
        `First name must be at most ${adminConstraints.firstName.maxLength} characters long`
      );
    }
  }

  getValue(): string {
    return this.firstName;
  }

  static clone(firstName: AdminFirstName): AdminFirstName {
    return new AdminFirstName(firstName.getValue());
  }
}
