import { Router } from "express";
import { PaymentController } from "./controllers/paymentController.js";
import { webpayPlusConfirmUrlRoutePath } from "./controllers/createWebpayPlusPaymentGatewayLink.js";
import { PermissionMiddleware } from "../../auth/infrastructure/middlewares/permissionMiddleware.js";
import { validPermissionOptions } from "../../admin/domain/validPermissions.js";

export const paymentRouter = Router();

paymentRouter.get(
  "/",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.VIEW_PAYMENT,
  }),
  PaymentController.listPayments
);

paymentRouter.get(
  "/:transactionId",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.VIEW_PAYMENT,
  }),
  PaymentController.getPaymentTransactionById
);

paymentRouter.post(
  "/gateways/webpay-plus/init",
  PaymentController.createWebpayPlusPaymentGatewayLink
);

paymentRouter.get(
  webpayPlusConfirmUrlRoutePath,
  PaymentController.processWebpayPlusPaymentGateway
);
