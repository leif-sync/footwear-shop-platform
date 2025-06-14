import { Router } from "express";
import { SizeController } from "./expressSizeController.js";
import { PermissionMiddleware } from "../../auth/infrastructure/middlewares/permissionMiddleware.js";
import { validPermissionOptions } from "../../admin/domain/validPermissions.js";
export const sizeRouter = Router();

sizeRouter.get(
  "/",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.VIEW_SIZE,
  }),
  SizeController.listSizes
);

sizeRouter.post(
  "/",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.CREATE_SIZE,
  }),
  SizeController.createSize
);

sizeRouter.delete(
  "/:sizeId",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.DELETE_SIZE,
  }),
  SizeController.deleteSize
);
