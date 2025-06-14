import { Email } from "../../shared/domain/email.js";
import { Phone } from "../../shared/domain/phone.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Admin } from "../domain/admin.js";
import { AdminFirstName } from "../domain/adminFirstName.js";
import { AdminLastName } from "../domain/adminLastName.js";
import { AdminNotifier } from "../domain/adminNotifier.js";
import { AdminPermission } from "../domain/adminPermission.js";
import { AdminRepository } from "../domain/adminRepository.js";
import { AdminNotFoundError } from "../domain/errors/adminNotFoundError.js";
import { validPermissionOptions } from "../domain/validPermissions.js";

export class UpdatePartialAdmin {
  private readonly adminRepository: AdminRepository;
  private readonly adminNotifier: AdminNotifier;

  constructor(params: {
    adminRepository: AdminRepository;
    adminNotifier: AdminNotifier;
  }) {
    this.adminRepository = params.adminRepository;
    this.adminNotifier = params.adminNotifier;
  }

  async run(params: {
    adminId: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    permissions?: validPermissionOptions[];
  }) {
    const adminId = new UUID(params.adminId);
    const adminFound = await this.adminRepository.find({ adminId });
    if (!adminFound) throw new AdminNotFoundError({ adminId });

    const firstName = params.firstName ?? adminFound.getFirstName();
    const lastName = params.lastName ?? adminFound.getLastName();
    const email = adminFound.getEmail();
    const phoneNumber = params.phoneNumber ?? adminFound.getPhoneNumber();
    const permissions = params.permissions ?? adminFound.getPermissions();
    const updatedAt = new Date();
    const createdAt = adminFound.getCreatedAt();

    const admin = new Admin({
      adminId,
      firstName: new AdminFirstName(firstName),
      lastName: new AdminLastName(lastName),
      email: new Email(email),
      phoneNumber: new Phone(phoneNumber),
      permissions: permissions.map(AdminPermission.create),
      updatedAt,
      createdAt,
    });

    await this.adminRepository.update({ admin });
    await this.adminNotifier.notifyAdminUpdate({ admin });
  }
}
