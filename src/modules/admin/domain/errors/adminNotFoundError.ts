import { EmailAddress } from "../../../shared/domain/emailAddress.js";
import { UUID } from "../../../shared/domain/UUID.js";

/**
 * This error is used to indicate that an admin with the specified ID or email was not found in the system.
 * It can be instantiated with either an adminId or an adminEmail.
 */
export class AdminNotFoundError extends Error {
  constructor(params: { adminId: string | UUID });
  constructor(params: { adminEmail: string | EmailAddress });

  constructor(params: {
    adminId?: string | UUID;
    adminEmail?: string | EmailAddress;
  }) {
    const { adminId, adminEmail } = params;
    if (adminId) {
      const id = adminId instanceof UUID ? adminId.getValue() : adminId;
      super(`Admin with ID ${id} not found`);
      return;
    }
    if (adminEmail) {
      const email =
        adminEmail instanceof EmailAddress ? adminEmail.getValue() : adminEmail;
      super(`Admin with email ${email} not found`);
      return;
    }
    throw new TypeError("Either adminId or adminEmail must be provided");
  }
}
