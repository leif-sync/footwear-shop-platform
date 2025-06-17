import { UUID } from "../../shared/domain/UUID.js";
import { Detail } from "../domain/detail.js";
import { DetailAlreadyExistsError } from "../domain/detailAlreadyExistsError.js";
import { DetailRepository } from "../domain/detailRepository.js";
import { DetailTitle } from "../domain/detailTitle.js";

/**
 * CreateDetail is a use case for creating a new detail.
 * It checks if the detail already exists and throws an error if it does.
 * If the detail does not exist, it creates a new detail and returns its ID.
 */
export class CreateDetail {
  private readonly detailRepository: DetailRepository;

  constructor(params: { detailRepository: DetailRepository }) {
    this.detailRepository = params.detailRepository;
  }

  /**
   * Creates a new detail.
   * @param params - The parameters for creating the detail.
   * @param params.detailTitle - The title of the detail to be created.
   * @returns The ID of the created detail.
   * @throws {DetailAlreadyExistsError} If a detail with the same title already exists.
   */
  async run(params: { detailTitle: DetailTitle }) {
    const { detailTitle } = params;

    const id = UUID.generateRandomUUID();
    const detail = new Detail({ detailId: id, detailTitle });

    const existingDetail = await this.detailRepository.find({
      detailTitle: detailTitle,
    });
    if (existingDetail)
      throw new DetailAlreadyExistsError({ detailTitle: detailTitle });

    await this.detailRepository.create({ detail });

    return {
      detailId: id.getValue(),
    };
  }
}
