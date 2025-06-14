import { Email } from "../../shared/domain/email.js";
import { Phone } from "../../shared/domain/phone.js";
import { UUID } from "../../shared/domain/UUID.js";
import { AdminFirstName } from "./adminFirstName.js";
import { AdminLastName } from "./adminLastName.js";
import { AdminPermission } from "./adminPermission.js";

export class Admin {
  private readonly adminId: UUID;
  private readonly firstName: AdminFirstName;
  private readonly lastName: AdminLastName;
  private readonly email: Email;
  private readonly phoneNumber: Phone;
  private readonly permissions: AdminPermission[];
  private readonly updatedAt: Date;
  private readonly createdAt: Date;

  constructor(params: {
    adminId: UUID;
    firstName: AdminFirstName;
    lastName: AdminLastName;
    email: Email;
    phoneNumber: Phone;
    permissions: AdminPermission[];
    updatedAt: Date;
    createdAt: Date;
  }) {
    this.adminId = UUID.clone(params.adminId);
    this.firstName = AdminFirstName.clone(params.firstName);
    this.lastName = AdminLastName.clone(params.lastName);
    this.email = Email.clone(params.email);
    this.phoneNumber = Phone.clone(params.phoneNumber);
    this.permissions = params.permissions.map(AdminPermission.clone);
    this.updatedAt = new Date(params.updatedAt);
    this.createdAt = new Date(params.createdAt);

    if (this.permissions.length === 0) {
      throw new Error("Admin must have at least one permission");
    }
  }

  getAdminId(): string {
    return this.adminId.getValue();
  }
  getFirstName(): string {
    return this.firstName.getValue();
  }
  getLastName(): string {
    return this.lastName.getValue();
  }
  getEmail(): string {
    return this.email.getValue();
  }
  getPhoneNumber(): string {
    return this.phoneNumber.getValue();
  }
  getPermissions() {
    return this.permissions.map((permission) => permission.getPermissionName());
  }
  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }
  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
  toPrimitives() {
    return {
      adminId: this.adminId.getValue(),
      firstName: this.firstName.getValue(),
      lastName: this.lastName.getValue(),
      email: this.email.getValue(),
      phoneNumber: this.phoneNumber.getValue(),
      permissions: this.permissions.map((permission) =>
        permission.getPermissionName()
      ),
      updatedAt: this.updatedAt,
      createdAt: this.createdAt,
    };
  }
}
