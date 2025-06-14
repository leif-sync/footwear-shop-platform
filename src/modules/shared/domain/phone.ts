import { parsePhoneNumberWithError } from "libphonenumber-js/max";

export class PhoneError extends Error {
  constructor(params: { invalidPhone: string }) {
    super(`Invalid phone number: ${params.invalidPhone}`);
  }
}

export class Phone {
  private readonly phoneNumber: string;

  constructor(phone: string) {
    const validPhone = this.ensureIsValid(phone);
    this.phoneNumber = validPhone;
  }

  private ensureIsValid(phone: string) {
    try {
      return parsePhoneNumberWithError(phone).formatInternational();
    } catch (_) {
      throw new PhoneError({ invalidPhone: phone });
    }
  }

  getValue(): string {
    return this.phoneNumber;
  }

  static clone(phone: Phone): Phone {
    return new Phone(phone.getValue());
  }
}
