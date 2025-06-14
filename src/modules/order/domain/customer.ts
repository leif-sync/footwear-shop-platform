import { Email } from "../../shared/domain/email.js";
import { Phone } from "../../shared/domain/phone.js";

export class Customer {
  private readonly firstName: string;
  private readonly lastName: string;
  private readonly email: Email;
  private readonly phone: Phone;

  constructor(params: {
    firstName: string;
    lastName: string;
    email: Email;
    phone: Phone;
  }) {
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.email = Email.clone(params.email);
    this.phone = Phone.clone(params.phone);
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.firstName.length === 0) throw new Error("First name is required");
    if (this.lastName.length === 0) throw new Error("Last name is required");
  }

  static clone(customer: Customer): Customer {
    return new Customer({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: new Email(customer.email.getValue()),
      phone: customer.phone,
    });
  }

  getFirstName() {
    return this.firstName;
  }

  getLastName() {
    return this.lastName
  }

  getEmail() {
    return this.email.getValue()
  }

  getPhone() {
    return this.phone;
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  toPrimitives() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email.getValue(),
      phone: this.phone.getValue(),
    };
  }
}
