import { adminConstraints } from "./adminConstraints.js";
import {
  isValidPermission,
  validPermissionOptions,
} from "./validPermissions.js";

/**
 * Represents a permission assigned to an admin.
 */
export class AdminPermission {
  private readonly permissionName: validPermissionOptions;

  constructor(permissionName: validPermissionOptions) {
    this.permissionName = permissionName;
    const isPermissionNameTooShort =
      permissionName.length < adminConstraints.permission.minLength;

    const isPermissionNameTooLong =
      permissionName.length > adminConstraints.permission.maxLength;

    if (isPermissionNameTooShort || isPermissionNameTooLong) {
      throw new Error(
        `Permission name must be between ${adminConstraints.permission.minLength} and ${adminConstraints.permission.maxLength} characters long.`
      );
    }

    if (!isValidPermission({ permission: permissionName })) {
      throw new Error(`Invalid permission name: ${permissionName}`);
    }
  }

  getPermissionName() {
    return this.permissionName;
  }

  static create(permissionName: validPermissionOptions) {
    return new AdminPermission(permissionName);
  }

  static clone(permission: AdminPermission): AdminPermission {
    return new AdminPermission(permission.getPermissionName());
  }
}
