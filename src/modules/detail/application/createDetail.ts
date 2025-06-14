import { UUID } from "../../shared/domain/UUID.js";
import { Detail } from "../domain/detail.js";
import { DetailAlreadyExistsError } from "../domain/detailAlreadyExistsError.js";
import { DetailRepository } from "../domain/detailRepository.js";

export class CreateDetail {
  private readonly detailRepository: DetailRepository;

  constructor(params: { detailRepository: DetailRepository }) {
    this.detailRepository = params.detailRepository;
  }

  async run(params: { detailName: string }) {
    const { detailName } = params;

    const id = UUID.generateRandomUUID();
    const detail = new Detail({ detailId: id, detailName });

    const existingDetail = await this.detailRepository.find({ detailName });
    if (existingDetail) throw new DetailAlreadyExistsError({ detailName });

    await this.detailRepository.create({ detail });

    return {
      detailId: id.getValue(),
    }
  }
}
