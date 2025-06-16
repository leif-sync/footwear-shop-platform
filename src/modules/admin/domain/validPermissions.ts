/**
 * @file validPermissions.ts
 * @description This file defines the valid permissions for the admin module.
 * It exports an enum of valid permission options and a function to validate permissions.
 */
export enum validPermissionOptions {
  // permisos para los productos
  CREATE_PRODUCT = "CREATE_PRODUCT",
  UPDATE_PRODUCT = "UPDATE_PRODUCT",
  DELETE_PRODUCT = "DELETE_PRODUCT",
  // permisos para las variantes
  CREATE_VARIANT = "CREATE_VARIANT",
  UPDATE_VARIANT = "UPDATE_VARIANT",
  DELETE_VARIANT = "DELETE_VARIANT",
  // permisos para las categorías
  CREATE_CATEGORY = "CREATE_CATEGORY",
  DELETE_CATEGORY = "DELETE_CATEGORY",
  VIEW_CATEGORY = "VIEW_CATEGORY",
  // permisos para los detalles
  CREATE_DETAIL = "CREATE_DETAIL",
  VIEW_DETAIL = "VIEW_DETAIL",
  DELETE_DETAIL = "DELETE_DETAIL",
  // permisos para los pedidos
  UPDATE_ORDER = "UPDATE_ORDER",
  VIEW_ORDER = "VIEW_ORDER",
  // permisos para los sizes
  CREATE_SIZE = "CREATE_SIZE",
  DELETE_SIZE = "DELETE_SIZE",
  VIEW_SIZE = "VIEW_SIZE",
  // permisos para los tags
  CREATE_TAG = "CREATE_TAG",
  DELETE_TAG = "DELETE_TAG",
  VIEW_TAG = "VIEW_TAG",
  // permisos para los perfiles de administrador
  UPDATE_PROFILE = "UPDATE_PROFILE",
  // permisos para los pagos
  VIEW_PAYMENT = "VIEW_PAYMENT",
}

export async function isValidPermission(params: {
  permission: string;
}): Promise<boolean> {
  const { permission } = params;

  const isPermissionValid = Object.keys(validPermissionOptions).includes(
    permission
  );
  return isPermissionValid;
}
