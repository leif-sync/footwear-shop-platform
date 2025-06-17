import { UUID } from "../../shared/domain/UUID.js";
import { Detail } from "../domain/detail.js";
import { DetailNotFoundError } from "../domain/detailNotFoundError.js";
import { DetailRepository } from "../domain/detailRepository.js";
import { DetailTitle } from "../domain/detailTitle.js";

export class UpdateDetail {
  private readonly detailRepository: DetailRepository;

  constructor(params: { detailRepository: DetailRepository }) {
    this.detailRepository = params.detailRepository;
  }

  /**
   * Updates a detail's name.
   * @param params - The parameters for updating the detail.
   * @param params.detailId - The ID of the detail to be updated.
   * @param params.detailId - The new title for the detail.
   * @throws {DetailNotFoundError} If the detail with the given ID does not exist.
   */
  async run(params: { detailId: UUID; detailTitle: DetailTitle }) {
    const { detailId, detailTitle } = params;
    const detail = new Detail({ detailId, detailTitle });
    const detailFound = await this.detailRepository.find({ detailId });
    if (!detailFound) throw new DetailNotFoundError({ detailId });
    await this.detailRepository.update({ detail });
  }
}
