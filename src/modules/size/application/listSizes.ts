import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { SizeRepository } from "../domain/sizeRepository.js";

export class ListSizes {
  private readonly sizeRepository: SizeRepository;

  constructor(params: { sizeRepository: SizeRepository }) {
    this.sizeRepository = params.sizeRepository;
  }

  async run(params: { limit: number; offset: number }) {
    const limit = new PositiveInteger(params.limit);
    const offset = new NonNegativeInteger(params.offset);

    const sizes = await this.sizeRepository.list({
      limit,
      offset,
    });
    return sizes.map((size) => size.toPrimitives());
  }
}
