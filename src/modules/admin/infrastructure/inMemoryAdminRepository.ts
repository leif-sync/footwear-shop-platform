import { EmailAddress } from "../../shared/domain/emailAddress.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Admin } from "../domain/admin.js";
import { AdminRepository } from "../domain/adminRepository.js";
import { AdminNotFoundError } from "../domain/errors/adminNotFoundError.js";

export class InMemoryAdminRepository implements AdminRepository {
  private admins: Admin[] = [];

  async create(params: { admin: Admin }): Promise<void> {
    this.admins.push(params.admin);
  }

  async find(params: { adminId: UUID }): Promise<Admin | null>;
  async find(params: { adminEmail: EmailAddress }): Promise<Admin | null>;
  async find(
    params:
      | {
          adminId: UUID;
        }
      | {
          adminEmail: EmailAddress;
        }
  ): Promise<Admin | null> {
    const isAdminId = "adminId" in params;
    if (isAdminId) {
      const admin = this.admins.find((a) =>
        params.adminId.equals(a.getAdminId())
      );
      return admin ?? null;
    }

    const admin = this.admins.find((a) =>
      params.adminEmail.equals(a.getEmail())
    );

    return admin ?? null;
  }

  async update(params: { admin: Admin }): Promise<void> {
    const { admin } = params;
    const adminId = admin.getAdminId();
    const index = this.admins.findIndex((a) => a.getAdminId() === adminId);
    if (index === -1) throw new AdminNotFoundError({ adminId });
    this.admins[index] = admin;
  }
}
