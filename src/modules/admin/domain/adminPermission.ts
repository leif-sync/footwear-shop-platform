import {
  isValidPermission,
  validPermissionOptions,
} from "./validPermissions.js";

export class AdminPermissionError extends Error {
  constructor(params: { invalidPermission: string }) {
    super(`Invalid permission: ${params.invalidPermission}`);
  }
}

/**
 * Represents a permission assigned to an admin.
 */
export class AdminPermission {
  private readonly permissionName: validPermissionOptions;

  constructor(permissionName: validPermissionOptions) {
    this.permissionName = permissionName;
    if (!isValidPermission({ permission: permissionName })) {
      throw new AdminPermissionError({ invalidPermission: permissionName });
    }
  }

  getPermissionName() {
    return this.permissionName;
  }

  static create(permissionName: validPermissionOptions) {
    return new AdminPermission(permissionName);
  }

  static from(permissionName: string) {
    if (!isValidPermission({ permission: permissionName })) {
      throw new AdminPermissionError({ invalidPermission: permissionName });
    }
    return new AdminPermission(permissionName as validPermissionOptions);
  }

  static clone(permission: AdminPermission): AdminPermission {
    return new AdminPermission(permission.getPermissionName());
  }
}
