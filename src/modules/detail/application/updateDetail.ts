import { UUID } from "../../shared/domain/UUID.js";
import { Detail } from "../domain/detail.js";
import { DetailNotFoundError } from "../domain/detailNotFoundError.js";
import { DetailRepository } from "../domain/detailRepository.js";

export class UpdateDetail {
  private readonly detailRepository: DetailRepository;

  constructor(params: { detailRepository: DetailRepository }) {
    this.detailRepository = params.detailRepository;
  }

  async run(params: { detailId: string; detailName: string }) {
    const { detailName } = params;

    const detailId = new UUID(params.detailId);
    const detail = new Detail({ detailId, detailName });

    const detailFound = await this.detailRepository.find({ detailId });
    if (!detailFound) throw new DetailNotFoundError({ detailName });

    await this.detailRepository.update({ detail });
  }
}
