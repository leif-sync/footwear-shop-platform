import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { ServiceContainer } from "../../../shared/infrastructure/setupDependencies.js";
import { ProductNotFoundError } from "../../domain/errors/productNotFoundError.js";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { VariantPurchaseConflictError } from "../../domain/errors/variantPurchaseConflictError.js";
import { VariantNotFoundError } from "../../domain/errors/variantNotFoundError.js";
import { AtLeastOneVariantRequiredError } from "../../domain/errors/AtLeastOneVariantRequiredError.js";

const uuidSchema = z.string().uuid();

export async function deleteVariant(
  req: Request<{ productId: string; variantId: string }>,
  res: Response
) {
  try {
    const productId = uuidSchema.parse(req.params.productId);
    const variantId = uuidSchema.parse(req.params.variantId);

    await ServiceContainer.product.deleteVariant.run({
      productId,
      variantId,
    });
    res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Product not found",
        error: error.message,
      });
      return;
    }

    if (error instanceof VariantNotFoundError) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Variant not found",
        error: error.message,
      });
      return;
    }

    if (error instanceof VariantPurchaseConflictError) {
      res.status(HTTP_STATUS.CONFLICT).json({
        message: "Variant purchase conflict",
        error: error.message,
      });
      return;
    }

    if (error instanceof ZodError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid product or variant ID",
        error: error.issues,
      });
      return;
    }

    if (error instanceof AtLeastOneVariantRequiredError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Cannot delete the last variant of a product",
        error: error.message,
      });
      return;
    }

    throw error;
  }
}
