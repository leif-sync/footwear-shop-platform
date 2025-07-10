import { z, ZodError } from "zod";
import { Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/infrastructure/httpStatus.js";
import { ServiceContainer } from "../../shared/infrastructure/setupDependencies.js";
import { DetailAlreadyExistsError } from "../domain/detailAlreadyExistsError.js";
import { DetailInUseError } from "../domain/detailInUseError.js";
import { DetailNotFoundError } from "../domain/detailNotFoundError.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { DetailTitle } from "../domain/detailTitle.js";
import { UUID } from "../../shared/domain/UUID.js";

const createDetailSchema = z.object({
  detailTitle: z.string().nonempty(),
});

const updateDetailSchema = z.object({
  detailTitle: z.string().nonempty(),
});

const uuidSchema = z.string().uuid();

const listDetailsRequestSchema = z.object({
  limit: z.coerce.number().int().positive().max(100),
  offset: z.coerce.number().int().nonnegative(),
});

export class DetailController {
  static async listDetails(req: Request, res: Response) {
    try {
      const result = listDetailsRequestSchema.parse(req.query);
      const limit = new PositiveInteger(result.limit);
      const offset = new NonNegativeInteger(result.offset);
      const details = await ServiceContainer.detail.listDetails.run({
        limit,
        offset,
      });

      const totalDetailCount = await ServiceContainer.detail.countDetails.run();

      res.json({
        details,
        meta: {
          limit: limit.getValue(),
          offset: offset.getValue(),
          returnedDetailCount: details.length,
          totalDetailCount,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: "Invalid request query",
          errors: error.issues,
        });
        return;
      }

      throw error;
    }
  }

  static async createDetail(req: Request, res: Response) {
    const result = createDetailSchema.safeParse(req.body ?? {});
    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid request body",
        errors: result.error.issues,
      });
      return;
    }

    try {
      const detailTitle = new DetailTitle(result.data.detailTitle);
      await ServiceContainer.detail.createDetail.run({
        detailTitle,
      });
      res.status(HTTP_STATUS.CREATED).json({
        message: "Detail created",
      });
      return;
    } catch (error) {
      if (error instanceof DetailAlreadyExistsError) {
        res.status(HTTP_STATUS.CONFLICT).json({
          message: "Detail already exists",
        });
        return;
      }

      throw error;
    }
  }

  static async deleteDetail(req: Request<{ detailId: string }>, res: Response) {
    const result = uuidSchema.safeParse(req.params.detailId);
    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Invalid id" });
      return;
    }

    try {
      const detailId = new UUID(result.data);
      await ServiceContainer.detail.deleteDetail.run({ detailId });
      res.json({ message: "Detail deleted" });
    } catch (error) {
      if (error instanceof DetailNotFoundError) {
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Detail not found" });
        return;
      }

      if (error instanceof DetailInUseError) {
        res.status(HTTP_STATUS.CONFLICT).json({ message: "Detail is in use" });
        return;
      }

      throw error;
    }
  }

  static async updateDetail(req: Request<{ detailId: string }>, res: Response) {
    const result = uuidSchema.safeParse(req.params.detailId);
    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid id",
      });
      return;
    }

    const updateResult = updateDetailSchema.safeParse(req.body ?? {});
    if (!updateResult.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid request body",
        errors: updateResult.error.issues,
      });
      return;
    }

    try {
      const detailId = new UUID(result.data);
      const detailTitle = new DetailTitle(updateResult.data.detailTitle);
      await ServiceContainer.detail.updateDetail.run({
        detailId,
        detailTitle,
      });
      res.json({ message: "Detail updated" });
      return;
    } catch (error) {
      if (error instanceof DetailNotFoundError) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          message: "Detail not found",
        });
        return;
      }

      throw error;
    }
  }
}
