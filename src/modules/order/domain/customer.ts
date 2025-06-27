import { Email } from "../../shared/domain/email.js";
import { Phone } from "../../shared/domain/phone.js";
import { CustomerFirstName } from "./customerFirstName.js";
import { CustomerLastName } from "./customerLastName.js";

export interface PrimitiveCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export class Customer {
  private readonly firstName: CustomerFirstName;
  private readonly lastName: CustomerLastName;
  private readonly email: Email;
  private readonly phone: Phone;

  constructor(params: {
    firstName: CustomerFirstName;
    lastName: CustomerLastName;
    email: Email;
    phone: Phone;
  }) {
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.email = params.email;
    this.phone = params.phone;
  }

  static clone(customer: Customer): Customer {
    return new Customer({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
    });
  }

  clone() {
    return Customer.clone(this);
  }

  getFirstName(): CustomerFirstName {
    return this.firstName;
  }

  getLastName(): CustomerLastName {
    return this.lastName;
  }

  getEmail(): Email {
    return this.email;
  }

  getPhone(): Phone {
    return this.phone;
  }

  getFullName(): string {
    return `${this.firstName.getValue()} ${this.lastName.getValue()}`;
  }

  toPrimitives(): PrimitiveCustomer {
    return {
      firstName: this.firstName.getValue(),
      lastName: this.lastName.getValue(),
      email: this.email.getValue(),
      phone: this.phone.getValue(),
    };
  }

  static from(primitive: PrimitiveCustomer): Customer {
    return new Customer({
      firstName: new CustomerFirstName(primitive.firstName),
      lastName: new CustomerLastName(primitive.lastName),
      email: new Email(primitive.email),
      phone: new Phone(primitive.phone),
    });
  }
}
