import { TagRepository } from "../domain/tagRepository.js";
import { prismaConnection } from "../../shared/infrastructure/prismaClient.js";
import { Tag } from "../domain/tag.js";
import { UUID } from "../../shared/domain/UUID.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";

export class PostgreSqlTagRepository implements TagRepository {
  async create(params: { tag: Tag }): Promise<void> {
    const { tagId, tagName } = params.tag.toPrimitives();

    await prismaConnection.tag.create({
      data: {
        tagId,
        name: tagName,
      },
    });
  }

  async find(params: { tagId: UUID }): Promise<Tag | null>;
  async find(params: { tagName: string }): Promise<Tag | null>;
  async find(
    params: { tagId: UUID } | { tagName: string }
  ): Promise<Tag | null> {
    const isTagId = "tagId" in params;
    if (isTagId) {
      const tagId = params.tagId.getValue();
      const tag = await prismaConnection.tag.findUnique({
        where: { tagId },
      });

      if (!tag) return null;

      return new Tag({
        tagId: new UUID(tag.tagId),
        tagName: tag.name,
      });
    }

    const tagName = params.tagName;
    const tag = await prismaConnection.tag.findUnique({
      where: { name: tagName },
    });

    if (!tag) return null;

    return new Tag({
      tagId: new UUID(tag.tagId),
      tagName: tag.name,
    });
  }

  async list(params: {
    limit: PositiveInteger;
    offset: NonNegativeInteger;
  }): Promise<Tag[]> {
    const { limit, offset } = params;

    const tags = await prismaConnection.tag.findMany({
      take: limit.getValue(),
      skip: offset.getValue(),
    });

    return tags.map(
      (tag) =>
        new Tag({
          tagId: new UUID(tag.tagId),
          tagName: tag.name,
        })
    );
  }

  async countTags(): Promise<NonNegativeInteger> {
    const count = await prismaConnection.tag.count();
    return new NonNegativeInteger(count);
  }

  async delete(params: { tagId: UUID }): Promise<void>;
  async delete(params: { tagName: string }): Promise<void>;
  async delete(params: { tagId: UUID } | { tagName: string }): Promise<void> {
    const isTagId = "tagId" in params;
    if (isTagId) {
      const tagId = params.tagId.getValue();
      await prismaConnection.tag.delete({ where: { tagId } });
      return;
    }

    const tagName = params.tagName;
    await prismaConnection.tag.delete({ where: { name: tagName } });
  }

  async retrieveTagsByNames(tagNames: string | string[]): Promise<Tag[]> {
    const namesArray = Array.isArray(tagNames) ? tagNames : [tagNames];

    const tags = await prismaConnection.tag.findMany({
      where: {
        name: {
          in: namesArray,
        },
      },
    });

    return tags.map(
      (tag) =>
        new Tag({
          tagId: new UUID(tag.tagId),
          tagName: tag.name,
        })
    );
  }
}
