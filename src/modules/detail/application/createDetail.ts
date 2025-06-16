import { UUID } from "../../shared/domain/UUID.js";
import { Detail } from "../domain/detail.js";
import { DetailAlreadyExistsError } from "../domain/detailAlreadyExistsError.js";
import { DetailRepository } from "../domain/detailRepository.js";

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
   * @param params.detailName - The name of the detail to be created.
   * @returns The ID of the created detail.
   * @throws {DetailAlreadyExistsError} If a detail with the same name already exists.
   */
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
