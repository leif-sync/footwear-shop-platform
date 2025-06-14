import { UUID } from "../../shared/domain/UUID.js";
import { Tag } from "../domain/tag.js";
import { TagAlreadyExistsError } from "../domain/errors/tagAlreadyExistsError.js";
import { TagRepository } from "../domain/tagRepository.js";

export class CreateTag {
  private readonly tagRepository: TagRepository;

  constructor(params: { tagRepository: TagRepository }) {
    this.tagRepository = params.tagRepository;
  }

  async run(params: { tagName: string }) {
    const { tagName } = params;
    const tagFound = await this.tagRepository.find({ tagName });
    if (tagFound) throw new TagAlreadyExistsError({ tagName });

    const tagId = UUID.generateRandomUUID();
    const tag = new Tag({ tagName, tagId });

    await this.tagRepository.create({ tag });
    return {
      tagId: tagId.getValue(),
    };
  }
}
