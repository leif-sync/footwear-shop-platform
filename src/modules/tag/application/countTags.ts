import { TagRepository } from "../domain/tagRepository.js";

export class CountTags {
  private readonly tagRepository: TagRepository;

  constructor(params: { tagRepository: TagRepository }) {
    this.tagRepository = params.tagRepository;
  }

  async run(): Promise<number> {
    const count = await this.tagRepository.countTags();
    return count.getValue();
  }
}
