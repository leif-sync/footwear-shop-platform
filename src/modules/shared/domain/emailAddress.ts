// * para ser pragmáticos se utiliza zod para validar el email, es mejor que usar un regex simple
// * a futuro esto igual se puede cambiar sin que afecte a los demás módulos

import { z } from "zod";
const emailSchema = z.string().email();

export class EmailAddressError extends Error {
  constructor(params: { invalidEmailAddress: string }) {
    super(`Invalid email address: ${params.invalidEmailAddress}`);
  }
}

export class EmailAddress {
  private readonly value: string;

  constructor(value: string) {
    this.ensureIsValid(value);
    this.value = value;
  }

  private ensureIsValid(value: string): asserts value is string {
    const isEmailValid = emailSchema.safeParse(value).success;
    if (!isEmailValid) throw new EmailAddressError({ invalidEmailAddress: value });
  }

  static clone(email: EmailAddress): EmailAddress {
    return new EmailAddress(email.getValue());
  }

  getValue() {
    return this.value;
  }

  equals(email: EmailAddress | string): boolean {
    if (email instanceof EmailAddress) return this.value === email.getValue();
    return this.value === email;
  }
}
