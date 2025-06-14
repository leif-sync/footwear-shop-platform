import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { ServiceContainer } from "../../../shared/infrastructure/serviceContainer.js";
import { InvalidDetailError } from "../../domain/errors/invalidDetailError.js";
import { InvalidSizeError } from "../../domain/errors/invalidSizeError.js";
import { InvalidTagError } from "../../domain/errors/invalidTagError.js";
import { ProductNotFoundError } from "../../domain/errors/productNotFoundError.js";
import { Request, Response } from "express";
import { z, ZodError } from "zod";
import multer, { MulterError, memoryStorage } from "multer";
import { multerFileFilter } from "../multerConfig.js";
import { messagesFromMulterError } from "../multerConfig.js";
import { createUniqueVariantSchema } from "../schemas/variant.js";
import { variantConstraint } from "../../domain/variantConstraints.js";

const createVariantMulterLimits: Required<multer.Options["limits"]> = {
  files: variantConstraint.image.maxImages,
  fileSize: variantConstraint.image.maxFileSizeBytes,
  fieldSize: 500 * 1024, // bytes
  fieldNameSize: 100, // bytes
  headerPairs: 100,
  fields: 1, // Solo se espera un campo con el JSON de la variante
  parts: 1 + variantConstraint.image.maxImages, // 1 json de variantes + cantidad de imágenes
};

export const memoryMulterUploadForVariant = multer({
  fileFilter: multerFileFilter,
  storage: memoryStorage(),
  limits: createVariantMulterLimits,
});

export const createVariantFieldNames = {
  variantImages: "variantImages",
  variantData: "variantData",
} as const;

const processVariantImageUploads = memoryMulterUploadForVariant.array(
  createVariantFieldNames.variantImages,
  variantConstraint.image.maxImages
);

const uuidSchema = z.string().uuid();

function handleErrorResponses(error: unknown, res: Response) {
  if (error instanceof MulterError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: messagesFromMulterError.get(error.code) ?? "Unknown error",
      errors: [error.message],
    });
    return;
  }

  // error al parsear el JSON
  if (error instanceof SyntaxError) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid JSON",
    });
  }

  if (error instanceof ZodError) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid variant data",
      errors: error.issues,
    });
  }

  if (error instanceof ProductNotFoundError) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: "Product not found",
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

  throw error;
}

// * los errores son manejados por el errorHandler
async function handleVariantUpload(
  productId: string,
  req: Request,
  res: Response
) {
  const variantDataToParse = req.body?.[createVariantFieldNames.variantData];

  const parsedVariant = createUniqueVariantSchema.parse(
    JSON.parse(variantDataToParse)
  );

  if (!Array.isArray(req.files)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "No files uploaded",
    });
  }

  if (req.files.length < variantConstraint.image.minImages) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: `Need at least ${variantConstraint.image.minImages} images`,
    });
  }

  const variantImages = req.files.map((file, index) => ({
    imageBuffer: file.buffer,
    imageAlt: parsedVariant.imagesAlt[index],
  }));

  const variant = await ServiceContainer.product.addVariantToProduct.run({
    productId: productId,
    variant: {
      details: parsedVariant.details,
      hexColor: parsedVariant.hexColor,
      sizes: parsedVariant.sizes,
      tags: parsedVariant.tags,
      visibility: parsedVariant.visibility,
      images: variantImages,
    },
  });

  return res.status(HTTP_STATUS.CREATED).json({
    variant: {
      variantId: variant.variantId,
    },
  });
}

export async function createVariant(
  req: Request<{ productId: string }>,
  res: Response
) {
  const resultId = uuidSchema.safeParse(req.params.productId);

  if (!resultId.success) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid product id",
    });
    return;
  }

  await processVariantImageUploads(req, res, async (err) => {
    try {
      if (err) throw err;
      return await handleVariantUpload(resultId.data, req, res);
    } catch (error) {
      return handleErrorResponses(error, res);
    }
  });
}
