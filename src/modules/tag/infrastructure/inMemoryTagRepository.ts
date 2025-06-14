import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Tag } from "../domain/tag.js";
import { TagRepository } from "../domain/tagRepository.js";

export class InMemoryTagRepository implements TagRepository {
  private tags: Tag[] = [];

  async create(params: { tag: Tag }): Promise<void> {
    this.tags.push(params.tag);
  }

  private async findTagById(tagId: UUID): Promise<Tag | null> {
    const tagFound = this.tags.find((tag) => tagId.equals(tag.getId()));
    if (!tagFound) return null;
    return Tag.clone(tagFound);
  }

  private async findTagByName(tagName: string): Promise<Tag | null> {
    const tagFound = this.tags.find((tag) => tag.getName() === tagName);
    if (!tagFound) return null;
    return Tag.clone(tagFound);
  }

  async find(params: { tagId: UUID }): Promise<Tag | null>;
  async find(params: { tagName: string }): Promise<Tag | null>;
  async find(params: { tagId?: UUID; tagName?: string }): Promise<Tag | null> {
    const { tagId, tagName } = params;
    if (tagId) return this.findTagById(tagId);
    if (tagName) return this.findTagByName(tagName);
    throw new Error("Invalid params");
  }

  async list(params: {
    limit: PositiveInteger;
    offset: NonNegativeInteger;
  }): Promise<Tag[]> {
    const limit = params.limit.getValue();
    const offset = params.offset.getValue();
    const tags = this.tags.slice(offset, offset + limit);
    return tags.map((tag) => Tag.clone(tag));
  }

  async countTags(): Promise<NonNegativeInteger> {
    const count = this.tags.length;
    return new NonNegativeInteger(count);
  }

  async deleteById(tagId: UUID): Promise<void> {
    this.tags = this.tags.filter((tag) => !tagId.equals(tag.getId()));
  }

  async deleteByName(tagName: string): Promise<void> {
    this.tags = this.tags.filter((tag) => tag.getName() !== tagName);
  }

  async delete(params: { tagId: UUID }): Promise<void>;
  async delete(params: { tagName: string }): Promise<void>;
  async delete(params: { tagId?: UUID; tagName?: string }): Promise<void> {
    const { tagId, tagName } = params;
    if (tagId) return this.deleteById(tagId);
    if (tagName) return this.deleteByName(tagName);
    throw new Error("Invalid params");
  }

  async retrieveTagsByNames(tagNames: string | string[]): Promise<Tag[]> {
    const tagNamesArray = Array.isArray(tagNames) ? tagNames : [tagNames];
    return this.tags.filter((tag) => tagNamesArray.includes(tag.getName()));
  }
}
