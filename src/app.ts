import express from "express";
import { productRouter } from "./modules/product/infrastructure/expressProductRouter.js";
import { imageUploader } from "./modules/shared/infrastructure/serviceContainer.js";
import {
  absoluteImageStoragePath,
  DiskImageUploader,
  publicImagesAPIEndpoint,
} from "./modules/product/infrastructure/diskImageUploader.js";
import { expressErrorHandler } from "./expressErrorHandler.js";
import { expressNotFoundHandler } from "./expressNotFoundHandler.js";
import { tagRouter } from "./modules/tag/infrastructure/expressTagRouter.js";
import { sizeRouter } from "./modules/size/infrastructure.ts/expressSizeRouter.js";
import { categoryRouter } from "./modules/category/infrastructure/expressCategoryRouter.js";
import { detailRouter } from "./modules/detail/infrastructure/expressDetailRouter.js";
import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "./modules/shared/infrastructure/httpStatus.js";
import { orderRouter } from "./modules/order/infrastructure/expressOrderRouter.js";
import { paymentRouter } from "./modules/payment/infrastructure/expressPaymentRouter.js";
await import("./seed.js");
import(
  "./modules/order/infrastructure/deleteOrderAndReleaseProductStockAutomatically.js"
);
import cookieParser from "cookie-parser";
import { authRouter } from "./modules/auth/infrastructure/expressAuthRouter.js";
import { adminRouter } from "./modules/admin/infrastructure/adminRouter.js";
import { paymentsEndpoint } from "./modules/payment/infrastructure/controllers/createWebpayPlusPaymentGatewayLink.js";

export const app = express();

const jsonMiddleware = express.json();

app.use((req: Request, res: Response, next: NextFunction) => {
  jsonMiddleware(req, res, (err) => {
    if (!err) return next();
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Invalid JSON" });
  });
});

app.use(cookieParser());

if (imageUploader instanceof DiskImageUploader) {
  app.use(publicImagesAPIEndpoint, express.static(absoluteImageStoragePath));
}

app.use("/api/v1/products", productRouter);
app.use("/api/v1/tags", tagRouter);
app.use("/api/v1/sizes", sizeRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/details", detailRouter);
app.use("/api/v1/orders", orderRouter);
app.use(paymentsEndpoint, paymentRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admins", adminRouter);

app.use(expressNotFoundHandler);
app.use(expressErrorHandler);
