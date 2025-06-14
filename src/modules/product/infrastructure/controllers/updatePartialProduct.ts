import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { ServiceContainer } from "../../../shared/infrastructure/serviceContainer.js";
import { InvalidCategoryError } from "../../domain/errors/invalidCategoryError.js";
import { ProductNotFoundError } from "../../domain/errors/productNotFoundError.js";
import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { updatePartialProductSchema } from "../schemas/product.js";

const uuidSchema = z.string().uuid();

export async function updatePartialProduct(
  req: Request<{ productId: string }>,
  res: Response
) {
  try {
    const productId = uuidSchema.parse(req.params.productId);
    const partialProduct = updatePartialProductSchema.parse(req.body);

    await ServiceContainer.product.updatePartialProduct.run({
      productId,
      price: partialProduct.price,
      productName: partialProduct.productName,
      productCategories: partialProduct.productCategories,
      productDescription: partialProduct.productDescription,
      productVisibility: partialProduct.visibility,
    });

    res.json({ message: "Product updated" });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid params",
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

    if (error instanceof InvalidCategoryError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid Category",
        errors: [error.message],
      });
      return;
    }

    throw error;
  }
}
