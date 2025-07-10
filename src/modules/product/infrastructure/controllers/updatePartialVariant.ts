import { Request, Response } from "express";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { ServiceContainer } from "../../../shared/infrastructure/setupDependencies.js";
import { InvalidDetailError } from "../../domain/errors/invalidDetailError.js";
import { InvalidSizeError } from "../../domain/errors/invalidSizeError.js";
import { InvalidTagError } from "../../domain/errors/invalidTagError.js";
import { ProductNotFoundError } from "../../domain/errors/productNotFoundError.js";
import { VariantNotFoundError } from "../../domain/errors/variantNotFoundError.js";
import { z, ZodError } from "zod";
import { updatePartialVariantSchema } from "../schemas/variant.js";
import { LastVisibleVariantCannotBeHiddenError } from "../../domain/errors/lastVisibleVariantCannotBeHiddenError.js";

const uuidSchema = z.string().uuid();

export async function updatePartialVariant(
  req: Request<{ productId: string; variantId: string }>,
  res: Response
) {
  try {
    const productId = uuidSchema.parse(req.params.productId);
    const variantId = uuidSchema.parse(req.params.variantId);
    const partialVariant = updatePartialVariantSchema.parse(req.body);

    await ServiceContainer.product.updatePartialVariant.run({
      productId,
      variant: {
        variantId,
        details: partialVariant.details?.map((detail) => ({
          title: detail.title,
          content: detail.content,
        })),
        hexColor: partialVariant.hexColor,
        tags: partialVariant.tags,
        visibility: partialVariant.visibility,
        sizes: partialVariant.sizes?.map((size) => ({
          sizeValue: size.sizeValue,
          stock: size.stock,
        })),
      },
    });

    res.json({
      message: "Variant updated",
    });
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

    if (error instanceof VariantNotFoundError) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Variant not found",
        errors: [error.message],
      });
      return;
    }

    if (error instanceof InvalidSizeError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid Size",
        errors: [error.message],
      });
      return;
    }

    if (error instanceof InvalidDetailError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid Detail",
        errors: [error.message],
      });
      return;
    }

    if (error instanceof InvalidTagError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid Tag",
        errors: [error.message],
      });
      return;
    }

    if (error instanceof LastVisibleVariantCannotBeHiddenError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Last visible variant cannot be hidden",
        errors: [error.message],
      });
      return;
    }

    throw error;
  }
}
