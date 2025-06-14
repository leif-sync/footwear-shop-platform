import { Router } from "express";
import { OrderController } from "./controllers/expressOrderController.js";
import { PermissionMiddleware } from "../../auth/infrastructure/middlewares/permissionMiddleware.js";
import { validPermissionOptions } from "../../admin/domain/validPermissions.js";
import { assignAdminToRequestIfPresent } from "../../auth/infrastructure/middlewares/assignAdminToRequestIfPresent.js";

export const orderRouter = Router();

orderRouter.post(
  "/",
  assignAdminToRequestIfPresent,
  OrderController.createOrder
);

orderRouter.get(
  "/",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.VIEW_ORDER,
  }),
  OrderController.listOrderOverviews
);

orderRouter.get(
  "/:orderId",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.VIEW_ORDER,
  }),
  OrderController.getOrderById
);

orderRouter.patch(
  "/:orderId",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.UPDATE_ORDER,
  }),
  OrderController.updatePartialOrder
);
