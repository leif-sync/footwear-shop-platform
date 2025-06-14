import { Email } from "../../../shared/domain/email.js";
import { UUID } from "../../../shared/domain/UUID.js";

export class AdminNotFoundError extends Error {
  constructor(params: { adminId: string | UUID });
  constructor(params: { adminEmail: string | Email });

  constructor(params: {
    adminId?: string | UUID;
    adminEmail?: string | Email;
  }) {
    const { adminId, adminEmail } = params;
    if (adminId) {
      const id = adminId instanceof UUID ? adminId.getValue() : adminId;
      super(`Admin with ID ${id} not found`);
      return;
    }
    if (adminEmail) {
      const email =
        adminEmail instanceof Email ? adminEmail.getValue() : adminEmail;
      super(`Admin with email ${email} not found`);
      return;
    }
    throw new TypeError("Either adminId or adminEmail must be provided");
  }
}
