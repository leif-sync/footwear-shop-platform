import { Router } from "express";
import { TagController } from "./expressTagController.js";
import { PermissionMiddleware } from "../../auth/infrastructure/middlewares/permissionMiddleware.js";
import { validPermissionOptions } from "../../admin/domain/validPermissions.js";

export const tagRouter = Router();

tagRouter.get(
  "/",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.VIEW_TAG,
  }),
  TagController.listTags
);

tagRouter.post(
  "/",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.CREATE_TAG,
  }),
  TagController.createTag
);

tagRouter.delete(
  "/:tagId",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.DELETE_TAG,
  }),
  TagController.deleteTag
);
