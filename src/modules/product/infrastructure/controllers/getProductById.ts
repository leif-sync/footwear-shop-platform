import { Request, Response } from "express";
import { ServiceContainer } from "../../../shared/infrastructure/setupDependencies.js";
import { ProductNotFoundError } from "../../domain/errors/productNotFoundError.js";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { z, ZodError } from "zod";
import { visibilityOptions } from "../../domain/visibility.js";

const uuidSchema = z.string().uuid();

export async function getProductById(
  req: Request<{ productId: string }>,
  res: Response
) {
  const isAdmin = req.admin;

  try {
    const productId = uuidSchema.parse(req.params.productId);

    const product = await ServiceContainer.product.getProduct.run({
      productId,
      productVisibility: isAdmin ? undefined : visibilityOptions.VISIBLE,
      variantsVisibility: isAdmin ? undefined : visibilityOptions.VISIBLE,
    });

    res.json({ product });
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Product not found",
        errors: [error.message],
      });
      return;
    }
    if (error instanceof ZodError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid request",
        errors: error.issues,
      });
      return;
    }

    throw error;
  }
}
