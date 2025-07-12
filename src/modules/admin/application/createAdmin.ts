import { AdminRepository } from "../domain/adminRepository.js";
import { Admin } from "../domain/admin.js";
import { UUID } from "../../shared/domain/UUID.js";
import { EmailAddress } from "../../shared/domain/emailAddress.js";
import { AdminFirstName } from "../domain/adminFirstName.js";
import { AdminLastName } from "../domain/adminLastName.js";
import { Phone } from "../../shared/domain/phone.js";
import { AdminPermission } from "../domain/adminPermission.js";
import { validPermissionOptions } from "../domain/validPermissions.js";
import { AdminAlreadyExistsError } from "../domain/errors/adminAlreadyExistsError.js";

/**
 * Use case for creating a new admin.
 * This class encapsulates the logic for creating an admin and interacting with the repository.
 * It ensures that the admin is created with all necessary fields and validations.
 */
export class CreateAdmin {
  private readonly adminRepository: AdminRepository;

  constructor(params: { adminRepository: AdminRepository }) {
    this.adminRepository = params.adminRepository;
  }

  /**
   * Creates a new admin with the provided details.
   * @param params - The parameters for creating the admin.
   * @param params.firstName - The first name of the admin.
   * @param params.lastName - The last name of the admin.
   * @param params.email - The email address of the admin.
   * @param params.phoneNumber - The phone number of the admin.
   * @param params.permissions - The permissions assigned to the admin.
   *
   * @returns {Promise<void>} A promise that resolves when the admin is successfully created.
   *
   * @throws {AdminAlreadyExistsError} If an admin with the same email already exists.
   */
  async run(params: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    permissions: validPermissionOptions[];
  }) {
    const adminEmail = new EmailAddress(params.email);

    const admin = new Admin({
      adminId: UUID.generateRandomUUID(),
      email: adminEmail,
      firstName: new AdminFirstName(params.firstName),
      lastName: new AdminLastName(params.lastName),
      phoneNumber: new Phone(params.phoneNumber),
      permissions: params.permissions.map(AdminPermission.create),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const adminFound = await this.adminRepository.find({
      adminEmail,
    });

    if (adminFound) throw new AdminAlreadyExistsError({ email: adminEmail });

    await this.adminRepository.create({ admin });
  }
}
