import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { DetailRepository } from "../domain/detailRepository.js";

export class ListDetails {
  private readonly detailRepository: DetailRepository;

  constructor(params: { detailRepository: DetailRepository }) {
    this.detailRepository = params.detailRepository;
  }

  async run(params: { limit: number; offset: number }) {
    const limit = new PositiveInteger(params.limit);
    const offset = new NonNegativeInteger(params.offset);
    const details = await this.detailRepository.list({ limit, offset });
    return details.map((detail) => detail.toPrimitives());
  }
}
