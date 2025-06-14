import { UUID } from "../../shared/domain/UUID.js";
import { ActiveTagError } from "../domain/errors/ActiveTagError.js";
import { TagNotFoundError } from "../domain/errors/tagNotFoundError.js";
import { TagRepository } from "../domain/tagRepository.js";
import { TagValidationService } from "../domain/tagValidationsService.js";

export class DeleteTag {
  private readonly tagRepository: TagRepository;
  private readonly tagValidationService: TagValidationService;

  constructor(params: {
    tagRepository: TagRepository;
    tagValidationService: TagValidationService;
  }) {
    this.tagRepository = params.tagRepository;
    this.tagValidationService = params.tagValidationService;
  }

  async deleteTagById(params: { tagId: string }) {
    const tagId = new UUID(params.tagId);

    const tagFound = await this.tagRepository.find({ tagId });
    if (!tagFound) throw new TagNotFoundError({ tagId: params.tagId });

    const tagName = tagFound.getName();
    const isTagInUse = await this.tagValidationService.checkTagUsage({
      tagName,
    });
    if (isTagInUse) throw new ActiveTagError({ tagName });

    await this.tagRepository.delete({ tagId });
  }

  async deleteTagByName(params: { tagName: string }) {
    const { tagName } = params;

    const tagFound = await this.tagRepository.find({ tagName });
    if (!tagFound) throw new TagNotFoundError({ tagName });

    const isTagInUse = await this.tagValidationService.checkTagUsage({
      tagName,
    });
    if (isTagInUse) throw new ActiveTagError({ tagName });

    await this.tagRepository.delete({ tagName });
  }

  async run(params: { tagId: string }): Promise<void>;
  async run(params: { tagName: string }): Promise<void>;
  async run(params: { tagId?: string; tagName?: string }) {
    const { tagId, tagName } = params;
    if (tagId) return this.deleteTagById({ tagId });
    if (tagName) return this.deleteTagByName({ tagName });
    throw new Error("Invalid params");
  }
}
