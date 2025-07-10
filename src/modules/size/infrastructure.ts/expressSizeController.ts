import { ServiceContainer } from "../../shared/infrastructure/setupDependencies.js";
import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { HTTP_STATUS } from "../../shared/infrastructure/httpStatus.js";
import { SizeAlreadyExistsError } from "../domain/errors/sizeAlreadyExistsError.js";
import { ActiveSizeError } from "../domain/errors/activeSizeError.js";
import { SizeNotFoundError } from "../domain/errors/sizeNotFoundError.js";

const createSizeSchema = z.object({
  sizeValue: z.number().int().positive(),
});

const sizeIdSchema = z.string().uuid();

const listSizesRequestSchema = z.object({
  limit: z.coerce.number().int().positive().max(100),
  offset: z.coerce.number().int().nonnegative(),
});

export class SizeController {
  static async listSizes(req: Request, res: Response) {
    try {
      const { limit, offset } = listSizesRequestSchema.parse(req.query ?? {});
      const sizes = await ServiceContainer.size.list.run({
        limit,
        offset,
      });

      const totalSizeCount = await ServiceContainer.size.countSizes.run();

      res.json({
        sizes,
        meta: {
          limit,
          offset,
          returnedSizeCount: sizes.length,
          totalSizeCount: totalSizeCount,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: "Invalid query parameters",
          errors: error.issues,
        });
        return;
      }

      throw error;
    }
  }

  static async createSize(req: Request, res: Response) {
    const result = createSizeSchema.safeParse(req.body ?? {});
    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Size value must be a positive integer",
        errors: result.error.issues,
      });
      return;
    }

    try {
      const { sizeValue } = result.data;
      await ServiceContainer.size.createSize.run({ sizeValue });
      res.status(HTTP_STATUS.CREATED).end();
      return;
    } catch (error) {
      if (error instanceof SizeAlreadyExistsError) {
        res.status(HTTP_STATUS.CONFLICT).json({
          message: "Size already exists",
        });
        return;
      }

      throw error;
    }
  }

  static async deleteSize(req: Request<{ sizeId: string }>, res: Response) {
    const result = sizeIdSchema.safeParse(req.params.sizeId);
    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid size id",
      });
      return;
    }

    try {
      const sizeId = result.data;
      await ServiceContainer.size.deleteSize.run({ sizeId });
      res.status(HTTP_STATUS.NO_CONTENT).end();
      return;
    } catch (error) {
      if (error instanceof SizeNotFoundError) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          message: "Size not found",
        });
        return;
      }

      if (error instanceof ActiveSizeError) {
        res.status(HTTP_STATUS.CONFLICT).json({
          message: "Size is in use",
        });
        return;
      }

      throw error;
    }
  }
}
