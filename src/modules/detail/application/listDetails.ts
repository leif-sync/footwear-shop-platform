import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { DetailRepository } from "../domain/detailRepository.js";

export class ListDetails {
  private readonly detailRepository: DetailRepository;

  constructor(params: { detailRepository: DetailRepository }) {
    this.detailRepository = params.detailRepository;
  }

  /**
   * Lists details with pagination.
   * @param params - The parameters for listing details.
   * @param params.limit - The maximum number of details to return, must be a positive integer.
   * @param params.offset - The number of details to skip before starting to collect the result set, must be a non-negative integer.
   * @returns An array of details, each represented as a primitive object.
   *
   * @throws {PositiveIntegerError} If the limit is not a positive integer.
   * @throws {NonNegativeError} If the offset is not a non-negative integer.
   */
  async run(params: { limit: PositiveInteger; offset: NonNegativeInteger }) {
    const { limit, offset } = params;
    const details = await this.detailRepository.list({ limit, offset });
    return details.map((detail) => detail.toPrimitives());
  }
}
