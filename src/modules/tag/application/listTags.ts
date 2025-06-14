import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { TagRepository } from "../domain/tagRepository.js";

export class ListTags {
  private readonly tagRepository: TagRepository;

  constructor(params: { tagRepository: TagRepository }) {
    this.tagRepository = params.tagRepository;
  }

  async run(params: { limit: number; offset: number }) {
    const limit = new PositiveInteger(params.limit);
    const offset = new NonNegativeInteger(params.offset);
    const tags = await this.tagRepository.list({
      limit,
      offset,
    });
    return tags.map((tag) => tag.toPrimitives());
  }
}
