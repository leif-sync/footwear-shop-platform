import { Email } from "../../../shared/domain/email.js";

/**
 * This error is used to indicate that an admin with the specified email already exists in the system.
 */
export class AdminAlreadyExistsError extends Error {
  constructor(params: { email: Email | string }) {
    const id =
      params.email instanceof Email ? params.email.getValue() : params.email;

    super(`Admin with email ${id} already exists.`);
  }
}
