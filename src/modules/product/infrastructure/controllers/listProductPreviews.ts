import { Request, Response } from "express";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { ServiceContainer } from "../../../shared/infrastructure/serviceContainer.js";
import { z, ZodError } from "zod";
import { visibilityOptions } from "../../domain/visibility.js";
import { visibilitySchema } from "../schemas/visibility.js";

export const userRequestOptionsSchema = z.object({
  limit: z.coerce.number().int().positive(),
  offset: z.coerce.number().int().nonnegative(),
  categories: z
    .preprocess(
      (data) => (Array.isArray(data) ? data : [data]),
      z.array(z.string())
    )
    .optional(),
});

const adminRequestOptionsSchema = userRequestOptionsSchema.extend({
  productVisibility: visibilitySchema.optional(),
  variantVisibility: visibilitySchema.optional(),
});

export async function listProductPreviews(
  req: Request,
  res: Response<
    | {
        products: any[];
        meta: {
          limit: number;
          offset: number;
          returnedProductCount: number;
          inventoryProductCount: number;
        };
      }
    | {
        message: string;
        errors: any[];
      }
  >
) {
  try {
    const MAX_LIMIT = 100;
    const isAdmin = req.admin;

    if (!isAdmin) {
      const { limit, offset, categories } = userRequestOptionsSchema.parse(
        req.query
      );
      const validLimit = Math.min(limit, MAX_LIMIT);

      const productVisibility = visibilityOptions.VISIBLE;

      const products = await ServiceContainer.product.list.run({
        limit: validLimit,
        offset,
        categories,
        productVisibility,
        variantVisibility: visibilityOptions.VISIBLE,
      });

      const totalProducts =
        await ServiceContainer.product.countTotalProducts.run({
          categories,
          productVisibility,
        });

      res.json({
        products,
        meta: {
          limit: validLimit,
          offset,
          returnedProductCount: products.length,
          inventoryProductCount: totalProducts,
        },
      });
      return;
    }

    const { limit, offset, categories, productVisibility, variantVisibility } =
      adminRequestOptionsSchema.parse(req.query);
    const validLimit = Math.min(limit, MAX_LIMIT);

    const products = await ServiceContainer.product.list.run({
      limit: validLimit,
      offset,
      categories,
      productVisibility,
      variantVisibility,
    });

    const totalProducts = await ServiceContainer.product.countTotalProducts.run(
      {
        categories,
        productVisibility,
      }
    );

    res.json({
      products,
      meta: {
        limit: validLimit,
        offset,
        returnedProductCount: products.length,
        inventoryProductCount: totalProducts,
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

    throw error;
  }
}
