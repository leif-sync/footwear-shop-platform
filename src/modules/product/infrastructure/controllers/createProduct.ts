import multer, { memoryStorage, MulterError } from "multer";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { ServiceContainer } from "../../../shared/infrastructure/serviceContainer.js";
import { InvalidCategoryError } from "../../domain/errors/invalidCategoryError.js";
import { InvalidDetailError } from "../../domain/errors/invalidDetailError.js";
import { InvalidSizeError } from "../../domain/errors/invalidSizeError.js";
import { InvalidTagError } from "../../domain/errors/invalidTagError.js";
import { Request, Response } from "express";
import { messagesFromMulterError, multerFileFilter } from "../multerConfig.js";
import { productSchema } from "../schemas/product.js";
import { ZodError } from "zod";
import { visibilityOptions } from "../../domain/visibility.js";
import { DiscountOptions } from "../../domain/discountType.js";
import { variantConstraint } from "../../domain/variantConstraints.js";
import { productConstraint } from "../../domain/productConstraints.js";

const maxFiles =
  productConstraint.variants.maxVariants * variantConstraint.image.maxImages;

const minFilesRequired =
  productConstraint.variants.minVariants * variantConstraint.image.minImages;

const createProductLimits: Required<multer.Options["limits"]> = {
  fieldNameSize: 100,
  fieldSize: 1 * 1024 * 1024,
  fields: 1, // contendrá un string json de los productos
  fileSize: variantConstraint.image.maxFileSizeBytes,
  files: maxFiles,
  parts: 1 + maxFiles, // 1 json de productos + cantidad de imágenes de todos los productos
  headerPairs: 100,
} as const;

export const memoryMulterUploadForProduct = multer({
  storage: memoryStorage(),
  limits: createProductLimits,
  fileFilter: multerFileFilter,
});

const productImagesUploadHandler = memoryMulterUploadForProduct.any();

export interface ProductUploaded {
  productName: string;
  productDescription: string;
  productCategories: string[];
  price: {
    baseValue: number;
    discountType: DiscountOptions;
    discountValue: number;
    discountStartAt: Date | null;
    discountEndAt: Date | null;
  };
  variants: {
    sizes: { sizeValue: number; stock: number }[];
    details: { title: string; content: string }[];
    tags: string[];
    hexColor: string;
    images: { imageBuffer: Buffer; imageAlt: string }[];
    visibility: visibilityOptions;
  }[];
  visibility: visibilityOptions;
}

function handleErrorResponses(error: unknown, res: Response) {
  if (error instanceof MulterError) {
    const message = messagesFromMulterError.get(error.code) ?? "Unknown error";
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message,
    });
    return;
  }

  if (error instanceof SyntaxError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid JSON",
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid product format",
      details: error.issues,
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

  if (error instanceof InvalidTagError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Invalid Tag",
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

  throw error;
}

export const createProductFieldData = "productData";

// * los errores son manejados por el errorHandler
async function handleProductUpload(req: Request, res: Response) {
  // Verifica si el producto está presente y es un JSON válido
  const parsedProduct = productSchema.parse(
    JSON.parse(req.body?.[createProductFieldData])
  );

  if (!Array.isArray(req.files) || req.files.length < minFilesRequired) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "No files uploaded",
    });
    return;
  }

  // recuperar los campos de las imágenes de cada variante
  const expectedImageFields = parsedProduct.variants.map(
    (variant) => variant.imagesField
  );

  // Filtra los archivos cargados según los campos dinámicos
  const filteredFiles: Record<string, Express.Multer.File[]> = {};

  for (const file of req.files) {
    const fileField = file.fieldname;
    const isFieldUnexpected = !expectedImageFields.includes(fileField);
    if (isFieldUnexpected) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: `Field ${fileField} is not allowed`,
      });
    }
    if (!filteredFiles[fileField]) filteredFiles[fileField] = [];
    filteredFiles[fileField].push(file);
  }

  for (const expectedField of expectedImageFields) {
    if (filteredFiles[expectedField]) continue;

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: `Field ${expectedField} is required`,
    });
  }

  for (const key in filteredFiles) {
    const variantFiles = filteredFiles[key];
    const variantFileCount = variantFiles.length;

    const minimumRequiredImages = variantConstraint.image.minImages;
    const maxImageAllowed = variantConstraint.image.maxImages;

    const hasMinRequiredImages = variantFileCount >= minimumRequiredImages;
    const areImagesUnderMax = variantFileCount <= maxImageAllowed;
    const isImageCountValid = hasMinRequiredImages && areImagesUnderMax;

    if (isImageCountValid) continue;

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: `Field ${key} must have at least ${minimumRequiredImages} images and at most ${maxImageAllowed} images`,
    });
  }

  for (const variant of parsedProduct.variants) {
    const imageAltCount = variant.imagesAlt.length;
    const imageFileCount = filteredFiles[variant.imagesField].length;
    const isImageCountMatching = imageAltCount === imageFileCount;
    if (isImageCountMatching) continue;

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: `Field ${variant.imagesField} must have the same amount of images as imagesAlt`,
    });
  }

  const validProduct: ProductUploaded = {
    productName: parsedProduct.productName,
    productDescription: parsedProduct.productDescription,
    productCategories: parsedProduct.productCategories,
    price: parsedProduct.price,
    visibility: parsedProduct.visibility,
    variants: parsedProduct.variants.map((variant) => ({
      sizes: variant.sizes,
      details: variant.details,
      tags: variant.tags,
      hexColor: variant.hexColor,
      images: variant.imagesAlt.map((imageAlt, index) => ({
        imageBuffer: filteredFiles[variant.imagesField][index].buffer,
        imageAlt,
      })),
      visibility: variant.visibility,
    })),
  };

  const { productId } =
    await ServiceContainer.product.createProduct.run(validProduct);

  return res.status(HTTP_STATUS.CREATED).json({
    product: {
      productId,
    },
  });
}

export async function createProduct(req: Request, res: Response) {
  await productImagesUploadHandler(req, res, async (err) => {
    try {
      if (err) throw err;
      await handleProductUpload(req, res);
    } catch (error) {
      return handleErrorResponses(error, res);
    }
  });
}
