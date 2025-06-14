import { Router } from "express";
import { CategoryController } from "./expressCategoryController.js";
import { PermissionMiddleware } from "../../auth/infrastructure/middlewares/permissionMiddleware.js";
import { validPermissionOptions } from "../../admin/domain/validPermissions.js";

export const categoryRouter = Router();

categoryRouter.get(
  "/",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.VIEW_CATEGORY,
  }),
  CategoryController.listCategories
);

categoryRouter.post(
  "/",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.CREATE_CATEGORY,
  }),
  CategoryController.createCategory
);

categoryRouter.delete(
  "/:categoryId",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.DELETE_CATEGORY,
  }),
  CategoryController.deleteCategory
);
