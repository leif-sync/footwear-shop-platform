import { TagNotFoundError } from "../domain/errors/tagNotFoundError.js";
import { TagRepository } from "../domain/tagRepository.js";

export class GetTag {
  private readonly tagRepository: TagRepository;

  constructor(params: { tagRepository: TagRepository }) {
    this.tagRepository = params.tagRepository;
  }

  async run(params: { tagName: string }) {
    const { tagName } = params;

    const tag = await this.tagRepository.find({ tagName });
    if (!tag) throw new TagNotFoundError({ tagName });

    return tag.toPrimitives();
  }
}
