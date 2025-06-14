import { AdminRepository } from "../domain/adminRepository.js";
import { Admin } from "../domain/admin.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Email } from "../../shared/domain/email.js";
import { AdminFirstName } from "../domain/adminFirstName.js";
import { AdminLastName } from "../domain/adminLastName.js";
import { Phone } from "../../shared/domain/phone.js";
import { AdminPermission } from "../domain/adminPermission.js";
import { validPermissionOptions } from "../domain/validPermissions.js";

export class CreateAdmin {
  private readonly adminRepository: AdminRepository;

  constructor(params: { adminRepository: AdminRepository }) {
    this.adminRepository = params.adminRepository;
  }

  async run(params: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    permissions: validPermissionOptions[];
  }) {
    const admin = new Admin({
      adminId: UUID.generateRandomUUID(),
      email: new Email(params.email),
      firstName: new AdminFirstName(params.firstName),
      lastName: new AdminLastName(params.lastName),
      phoneNumber: new Phone(params.phoneNumber),
      permissions: params.permissions.map(AdminPermission.create),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.adminRepository.create({ admin });
  }
}
