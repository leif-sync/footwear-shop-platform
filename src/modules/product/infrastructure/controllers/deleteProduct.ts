import { Request, Response } from "express";
import { z } from "zod";
import { ServiceContainer } from "../../../shared/infrastructure/setupDependencies.js";
import { ProductNotFoundError } from "../../domain/errors/productNotFoundError.js";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { ProductPurchaseConflictError } from "../../domain/errors/productPurchaseConflictError.js";

const uuidSchema = z.string().uuid();

export async function deleteProduct(
  req: Request<{ productId: string }>,
  res: Response
) {
  try {
    const productId = uuidSchema.parse(req.params.productId);

    await ServiceContainer.product.deleteProduct.run({
      productId,
    });
    res.status(HTTP_STATUS.NO_CONTENT).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Product not found",
        error: error.message,
      });
      return;
    }

    if (error instanceof ProductPurchaseConflictError) {
      res.status(HTTP_STATUS.CONFLICT).json({
        message: "Product purchase conflict",
        error: error.message,
      });
      return;
    }

    if (error instanceof z.ZodError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid product ID",
        error: error.errors,
      });
      return;
    }

    throw error;
  }
}
