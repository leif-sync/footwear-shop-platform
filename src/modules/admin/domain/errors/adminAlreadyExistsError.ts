import { EmailAddress } from "../../../shared/domain/emailAddress.js";

/**
 * This error is used to indicate that an admin with the specified email already exists in the system.
 */
export class AdminAlreadyExistsError extends Error {
  constructor(params: { email: EmailAddress | string }) {
    const id =
      params.email instanceof EmailAddress
        ? params.email.getValue()
        : params.email;

    super(`Admin with email ${id} already exists.`);
  }
}
