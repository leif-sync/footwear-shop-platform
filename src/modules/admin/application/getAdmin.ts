import { Email } from "../../shared/domain/email.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Admin } from "../domain/admin.js";
import { AdminRepository } from "../domain/adminRepository.js";
import { AdminNotFoundError } from "../domain/errors/adminNotFoundError.js";

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

  async run(params: { adminId: string }): Promise<Admin>;
  async run(params: { adminEmail: string }): Promise<Admin>;
  async run(params: { adminId?: string; adminEmail?: string }): Promise<Admin> {
    const { adminId, adminEmail } = params;
    if (adminId) return this.findAdminById(adminId);
    if (adminEmail) return this.findAdminByEmail(adminEmail);
    throw new TypeError("Either adminId or adminEmail must be provided");
  }
}
