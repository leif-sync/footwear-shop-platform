import { UUID } from "../../shared/domain/UUID.js";
import { Detail } from "../domain/detail.js";
import { DetailNotFoundError } from "../domain/detailNotFoundError.js";
import { DetailRepository } from "../domain/detailRepository.js";

export class UpdateDetail {
  private readonly detailRepository: DetailRepository;

  constructor(params: { detailRepository: DetailRepository }) {
    this.detailRepository = params.detailRepository;
  }


  /**
   * Updates a detail's name.
   * @param params - The parameters for updating the detail.
   * @param params.detailId - The ID of the detail to be updated.
   * @param params.detailName - The new name for the detail.
   * @throws {DetailNotFoundError} If the detail with the given ID does not exist.
   */
  async run(params: { detailId: string; detailName: string }) {
    const { detailName } = params;

    const detailId = new UUID(params.detailId);
    const detail = new Detail({ detailId, detailName });

    const detailFound = await this.detailRepository.find({ detailId });
    if (!detailFound) throw new DetailNotFoundError({ detailId });

    await this.detailRepository.update({ detail });
  }
}
