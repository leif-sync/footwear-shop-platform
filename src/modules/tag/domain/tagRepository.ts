import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Tag } from "./tag.js";

export abstract class TagRepository {
  abstract countTags(): Promise<NonNegativeInteger>;

  abstract list(params: {
    limit: PositiveInteger;
    offset: NonNegativeInteger;
  }): Promise<Tag[]>;

  abstract retrieveTagsByNames(tagNames: string | string[]): Promise<Tag[]>;

  abstract create(params: { tag: Tag }): Promise<void>;

  abstract find(params: { tagId: UUID }): Promise<Tag | null>;
  abstract find(params: { tagName: string }): Promise<Tag | null>;

  abstract delete(params: { tagId: UUID }): Promise<void>;
  abstract delete(params: { tagName: string }): Promise<void>;
}
