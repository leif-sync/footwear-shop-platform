import { Router } from "express";
import { ProductController } from "./controllers/ProductController.js";
import { PermissionMiddleware } from "../../auth/infrastructure/middlewares/permissionMiddleware.js";
import { validPermissionOptions } from "../../admin/domain/validPermissions.js";
import { assignAdminToRequestIfPresent } from "../../auth/infrastructure/middlewares/assignAdminToRequestIfPresent.js";

export const productRouter = Router();

productRouter.post(
  "/",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.CREATE_PRODUCT,
  }),
  ProductController.createProduct
);
  
productRouter.get(
  "/",
  assignAdminToRequestIfPresent,
  ProductController.listProductPreviews
);

productRouter.get(
  "/:productId",
  assignAdminToRequestIfPresent,
  ProductController.getProductById
);

productRouter.patch(
  "/:productId",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.UPDATE_PRODUCT,
  }),
  ProductController.updatePartialProduct
);

productRouter.delete(
  "/:productId",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.DELETE_PRODUCT,
  }),
  ProductController.deleteProduct
);

productRouter.post(
  "/:productId/variants",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.CREATE_VARIANT,
  }),
  ProductController.createVariant
);

productRouter.patch(
  "/:productId/variants/:variantId",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.UPDATE_VARIANT,
  }),
  ProductController.updatePartialVariant
);

productRouter.delete(
  "/:productId/variants/:variantId",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.DELETE_VARIANT,
  }),
  ProductController.deleteVariant
);

productRouter.post(
  "/:productId/variants/:variantId/images",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.UPDATE_VARIANT,
  }),
  ProductController.addImageToVariant
);

productRouter.delete(
  "/:productId/variants/:variantId/images/:imageId",
  PermissionMiddleware.hasPermission({
    permission: validPermissionOptions.UPDATE_VARIANT,
  }),
  ProductController.deleteImageFromVariant
);
