import { Router } from "express";
import { DetailController } from "./expressDetailController.js";
import { validPermissionOptions } from "../../admin/domain/validPermissions.js";
import { PermissionMiddleware } from "../../auth/infrastructure/middlewares/permissionMiddleware.js";

export const detailRouter = Router();

detailRouter.get(
  "/",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.VIEW_DETAIL,
  }),
  DetailController.listDetails
);

detailRouter.post(
  "/",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.CREATE_DETAIL,
  }),
  DetailController.createDetail
);

detailRouter.delete(
  "/:detailId",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.DELETE_DETAIL,
  }),
  DetailController.deleteDetail
);
