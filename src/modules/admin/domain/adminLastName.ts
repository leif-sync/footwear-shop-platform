import { adminConstraints } from "./adminConstraints.js";

export class AdminLastName {
  private readonly lastName: string;
  constructor(lastName: string) {
    this.lastName = lastName;
    this.ensureIsValid(lastName);
  }
  private ensureIsValid(lastName: string): void {
    if (lastName.length < adminConstraints.lastName.minLength) {
      throw new Error(
        `Last name must be at least ${adminConstraints.lastName.minLength} characters long`
      );
    }
    if (lastName.length > adminConstraints.lastName.maxLength) {
      throw new Error(
        `Last name must be at most ${adminConstraints.lastName.maxLength} characters long`
      );
    }
  }

  getValue(): string {
    return this.lastName;
  }

  static clone(lastName: AdminLastName): AdminLastName {
    return new AdminLastName(lastName.getValue());
  }
}
