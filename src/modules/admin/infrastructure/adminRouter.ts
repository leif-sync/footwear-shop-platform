import { Router } from "express";
import { updatePartialAdmin } from "./controllers/updatePartialAdmin.js";
import { PermissionMiddleware } from "../../auth/infrastructure/middlewares/permissionMiddleware.js";
import { validPermissionOptions } from "../domain/validPermissions.js";

export const adminRouter = Router();

adminRouter.patch(
  "/:adminId",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.UPDATE_PROFILE,
  }),
  updatePartialAdmin
);
