import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { ServiceContainer } from "../../../shared/infrastructure/setupDependencies.js";
import { ProductNotFoundError } from "../../domain/errors/productNotFoundError.js";
import { VariantNotFoundError } from "../../domain/errors/variantNotFoundError.js";
import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { VariantImageNotFoundError } from "../../domain/errors/variantImageNotFoundError.js";
import { VariantImageConstraintError } from "../../domain/errors/variantImageConstraintError.js";

const uuidSchema = z.string().uuid();

function handleError(error: unknown, res: Response) {
  if (error instanceof ZodError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid request",
      errors: error.issues,
    });
    return;
  }

  if (error instanceof ProductNotFoundError) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: "Product not found",
      errors: [error.message],
    });
    return;
  }

  if (error instanceof VariantNotFoundError) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: "Variant not found",
      errors: [error.message],
    });
    return;
  }

  if (error instanceof VariantImageNotFoundError) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: "Variant image not found",
      errors: [error.message],
    });
    return;
  }

  if (error instanceof VariantImageConstraintError) {
    res.status(HTTP_STATUS.CONFLICT).json({
      message: "Variant image constraint error",
      errors: [
        "Cannot delete image because it would violate the minimum number of images required.",
      ],
    });
    return;
  }

  throw error;
}

export async function deleteImageFromVariant(
  req: Request<{ productId: string; variantId: string; imageId: string }>,
  res: Response
) {
  try {
    const productId = uuidSchema.parse(req.params.productId);
    const variantId = uuidSchema.parse(req.params.variantId);

    const imageId = req.params.imageId;

    if (!imageId) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Image id is required",
      });
      return;
    }
    await ServiceContainer.product.deleteImageFromVariant.run({
      productId,
      variantId,
      imageId,
    });

    res.json({ message: "Image deleted" });
  } catch (error) {
    handleError(error, res);
  }
}
