import { z, ZodError } from "zod";
import { ServiceContainer } from "../../shared/infrastructure/serviceContainer.js";
import { CategoryNotFoundError } from "../domain/errors/categoryNotFoundError.js";
import { ActiveCategoryError } from "../domain/errors/activeCategoryError.js";
import { Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/infrastructure/httpStatus.js";
import { CategoryAlreadyExistsError } from "../domain/errors/categoryAlreadyExistsError.js";
import { CategoryName } from "../domain/categoryName.js";
import { UUID } from "../../shared/domain/UUID.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";

const categorySchema = z.object({
  categoryName: z.string().nonempty(),
});

const categoryIdSchema = z.string().uuid();

const listCategoriesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100),
  offset: z.coerce.number().int().nonnegative(),
});
export class CategoryController {
  static async listCategories(req: Request, res: Response) {
    try {
      const result = listCategoriesQuerySchema.parse(req.query);

      const limit = new PositiveInteger(result.limit);
      const offset = new NonNegativeInteger(result.offset);

      const categories = await ServiceContainer.category.litCategories.run({
        limit,
        offset,
      });
      const totalCategoriesCount =
        await ServiceContainer.category.countCategories.run();

      res.json({
        categories,
        meta: {
          limit: limit.getValue(),
          offset: offset.getValue(),
          returnedCategoriesCount: categories.length,
          totalCategoriesCount: totalCategoriesCount,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: "Invalid query parameters",
          errors: error.issues,
        });
        return;
      }

      throw error;
    }
  }

  static async createCategory(req: Request, res: Response) {
    const result = categorySchema.safeParse(req.body ?? {});
    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid request body",
        errors: result.error.issues,
      });
      return;
    }

    try {
      const categoryName = new CategoryName(result.data.categoryName);
      await ServiceContainer.category.createCategory.run({ categoryName });
      res.status(HTTP_STATUS.CREATED).json({
        message: "Category created",
      });
      return;
    } catch (error) {
      if (error instanceof CategoryAlreadyExistsError) {
        res.status(HTTP_STATUS.CONFLICT).json({
          message: "Category already exists",
        });
        return;
      }

      throw error;
    }
  }

  static async deleteCategory(
    req: Request<{ categoryId: string }>,
    res: Response
  ) {
    try {
      const categoryId = new UUID(
        categoryIdSchema.parse(req.params.categoryId)
      );
      await ServiceContainer.category.deleteCategory.run({ categoryId });
      res.status(HTTP_STATUS.NO_CONTENT).end();
    } catch (error) {
      if (error instanceof CategoryNotFoundError) {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: "Category not found" });
        return;
      }

      if (error instanceof ActiveCategoryError) {
        res
          .status(HTTP_STATUS.CONFLICT)
          .json({ message: "Category is in use" });
        return;
      }

      if (error instanceof ZodError) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: "Invalid request parameters",
          errors: error.issues,
        });
        return;
      }

      throw error;
    }
  }
}
