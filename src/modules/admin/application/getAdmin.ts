import { Email } from "../../shared/domain/email.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Admin } from "../domain/admin.js";
import { AdminRepository } from "../domain/adminRepository.js";
import { AdminNotFoundError } from "../domain/errors/adminNotFoundError.js";

/**
 * Use case for retrieving an admin by either their ID or email.
 * This class encapsulates the logic for fetching an admin from the repository.
 */
export class GetAdmin {
  private readonly adminRepository: AdminRepository;

  constructor(params: { adminRepository: AdminRepository }) {
    this.adminRepository = params.adminRepository;
  }

  private async findAdminById(id: string): Promise<Admin> {
    const adminId = new UUID(id);
    const admin = await this.adminRepository.find({ adminId });
    if (!admin) throw new AdminNotFoundError({ adminId: id });
    return admin;
  }

  private async findAdminByEmail(email: string): Promise<Admin> {
    const adminEmail = new Email(email);
    const admin = await this.adminRepository.find({ adminEmail });
    if (!admin) throw new AdminNotFoundError({ adminEmail });
    return admin;
  }

  /**
   * Finds an admin by their ID.
   * @param params.adminId - The ID of the admin to find.
   * @returns - A promise that resolves to the found admin.
   * @throws {AdminNotFoundError} If no admin with the given ID is found.
   */
  async run(params: { adminId: string }): Promise<Admin>;

  /**
   * Finds an admin by their email.
   * @param params.adminEmail - The email of the admin to find.
   * @returns - A promise that resolves to the found admin.
   * @throws {AdminNotFoundError} If no admin with the given email is found.
   */
  async run(params: { adminEmail: string }): Promise<Admin>;
  async run(params: { adminId?: string; adminEmail?: string }): Promise<Admin> {
    const { adminId, adminEmail } = params;
    if (adminId) return this.findAdminById(adminId);
    if (adminEmail) return this.findAdminByEmail(adminEmail);
    throw new TypeError("Either adminId or adminEmail must be provided");
  }
}
