import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { ServiceContainer } from "../../../shared/infrastructure/setupDependencies.js";
import { ProductNotFoundError } from "../../domain/errors/productNotFoundError.js";
import { VariantNotFoundError } from "../../domain/errors/variantNotFoundError.js";
import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { memoryMulterUploadForVariant } from "./createVariant.js";
import { MulterError } from "multer";
import { messagesFromMulterError } from "../multerConfig.js";
import { addImageToVariantSchema } from "../schemas/variant.js";

const uuidSchema = z.string().uuid();

export const createNewImageForVariantField = "image";
const imageUploader = memoryMulterUploadForVariant.single(
  createNewImageForVariantField
);

export async function addImageToVariant(
  req: Request<{ productId: string; variantId: string }>,
  res: Response
) {
  const productIdResult = uuidSchema.safeParse(req.params.productId);
  if (!productIdResult.success) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid product id",
    });
    return;
  }

  const variantIdResult = uuidSchema.safeParse(req.params.variantId);
  if (!variantIdResult.success) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid variant id",
    });
    return;
  }

  await imageUploader(req, res, async (err) => {
    try {
      if (err) throw err;

      const { imageAlt } = addImageToVariantSchema.parse(req.body);

      const image = req.file;

      if (!image) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: "Image is required",
        });
        return;
      }

      const { imageUrl } = await ServiceContainer.product.addImageToVariant.run(
        {
          productId: productIdResult.data,
          variantId: variantIdResult.data,
          imageBuffer: image.buffer,
          imageAlt,
        }
      );

      res.status(HTTP_STATUS.CREATED).json({
        message: "Image added",
        image: {
          imageUrl,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: "Invalid request",
          errors: error.issues,
        });
        return;
      }

      if (error instanceof MulterError) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: messagesFromMulterError.get(err.code) ?? "Unknown error",
          errors: [err.message],
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

      throw error;
    }
  });
}
