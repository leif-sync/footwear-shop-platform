import { UUID } from "../../shared/domain/UUID.js";
import { PrimitiveDetail } from "../domain/detail.js";
import { DetailNotFoundError } from "../domain/detailNotFoundError.js";
import { DetailRepository } from "../domain/detailRepository.js";
import { DetailTitle } from "../domain/detailTitle.js";

/**
 * Class to get a detail by its ID or title.
 */
export class GetDetail {
  private readonly detailRepository: DetailRepository;

  constructor(params: { detailRepository: DetailRepository }) {
    this.detailRepository = params.detailRepository;
  }

  /**
   * Gets a detail by its ID.
   * @param detailId ID of the detail to get.
   * @returns The detail in primitive format.
   * @throws {DetailNotFoundError} If the detail is not found.
   */
  private async getDetailById(detailId: UUID) {
    const detail = await this.detailRepository.find({ detailId });
    if (!detail) throw new DetailNotFoundError({ detailId });
    return detail.toPrimitives();
  }

  /**
   * Gets a detail by its title.
   * @param detailTitle Title of the detail to get.
   * @returns The detail in primitive format.
   * @throws {DetailNotFoundError} If the detail is not found.
   */
  private async getDetailByTitle(detailTitle: DetailTitle) {
    const detail = await this.detailRepository.find({ detailTitle });
    if (!detail) throw new DetailNotFoundError({ detailTitle });
    return detail.toPrimitives();
  }

  /**
   * Executes the search for a detail by ID.
   * @param params Object with the ID of the detail to search for.
   * @returns The detail in primitive format.
   */
  async run(params: { detailId: UUID }): Promise<PrimitiveDetail>;
  /**
   * Executes the search for a detail by title.
   * @param params Object with the title of the detail to search for.
   * @returns The detail in primitive format.
   */
  async run(params: { detailTitle: DetailTitle }): Promise<PrimitiveDetail>;

  async run(
    params: { detailId: UUID } | { detailTitle: DetailTitle }
  ): Promise<PrimitiveDetail> {
    const isDetailId = "detailId" in params;
    if (isDetailId) return this.getDetailById(params.detailId);
    return this.getDetailByTitle(params.detailTitle);
  }
}
