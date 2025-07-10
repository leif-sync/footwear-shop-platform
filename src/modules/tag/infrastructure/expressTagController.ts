import { ServiceContainer } from "../../shared/infrastructure/setupDependencies.js";
import { Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/infrastructure/httpStatus.js";
import { z, ZodError } from "zod";
import { TagAlreadyExistsError } from "../domain/errors/tagAlreadyExistsError.js";
import { TagNotFoundError } from "../domain/errors/tagNotFoundError.js";
import { ActiveTagError } from "../domain/errors/ActiveTagError.js";

const createTagSchema = z.object({
  tagName: z.string().nonempty(),
});

const tagIdSchema = z.string().uuid();

const listTagsParamsSchema = z.object({
  limit: z.coerce.number().int().positive().max(100),
  offset: z.coerce.number().int().nonnegative(),
});

export class TagController {
  static async listTags(req: Request, res: Response) {
    try {
      const { limit, offset } = listTagsParamsSchema.parse(req.query);
      const tags = await ServiceContainer.tag.listTags.run({
        limit,
        offset,
      });

      const totalTagCount = await ServiceContainer.tag.countTags.run();

      res.json({
        tags,
        meta: {
          limit,
          offset,
          returnedTagCount: tags.length,
          totalTagCount,
        },
      });
      return;
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

  static async createTag(req: Request, res: Response) {
    const result = createTagSchema.safeParse(req.body ?? {});
    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid request body",
        errors: result.error.issues,
      });
      return;
    }

    try {
      const { tagName } = result.data;
      const { tagId } = await ServiceContainer.tag.createTag.run({ tagName });
      res.status(HTTP_STATUS.CREATED).json({
        tag: {
          tagName,
          tagId,
        },
      });
      return;
    } catch (error) {
      if (error instanceof TagAlreadyExistsError) {
        res.status(HTTP_STATUS.CONFLICT).json({
          message: "Tag already exists",
        });
        return;
      }

      throw error;
    }
  }

  static async deleteTag(req: Request<{ tagId: string }>, res: Response) {
    const result = tagIdSchema.safeParse(req.params.tagId);
    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Invalid tag ID",
      });
      return;
    }

    try {
      const tagId = result.data;
      await ServiceContainer.tag.deleteTag.run({ tagId });
      res.end();
      return;
    } catch (error) {
      if (error instanceof TagNotFoundError) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          message: "Tag not found",
        });
        return;
      }

      if (error instanceof ActiveTagError) {
        res.status(HTTP_STATUS.CONFLICT).json({
          message: "Tag in use",
        });
        return;
      }

      throw error;
    }
  }
}
