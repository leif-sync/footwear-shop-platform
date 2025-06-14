import { ProductRepository } from "../../product/domain/productRepository.js";
import { UUID } from "../../shared/domain/UUID.js";
import { DetailInUseError } from "../domain/detailInUseError.js";
import { DetailNotFoundError } from "../domain/detailNotFoundError.js";
import { DetailRepository } from "../domain/detailRepository.js";

type deleteParams = { detailId?: string; detailName?: string };

export class DeleteDetail {
  private readonly detailRepository: DetailRepository;
  private readonly productRepository: ProductRepository;

  constructor(params: {
    detailRepository: DetailRepository;
    productRepository: ProductRepository;
  }) {
    this.detailRepository = params.detailRepository;
    this.productRepository = params.productRepository;
  }

  private async deleteById(id: string) {
    const detailId = new UUID(id);
    const detailFound = await this.detailRepository.find({ detailId });
    if (!detailFound) throw new DetailNotFoundError({ detailId: id });

    const detailName = detailFound.getTitle();

    const isDetailUsed = await this.productRepository.checkDetailUsage({
      detailName,
    });

    if (isDetailUsed) throw new DetailInUseError({ detailName });

    await this.detailRepository.delete({ detailId });
  }

  private async deleteByName(detailName: string) {
    const detailFound = await this.detailRepository.find({ detailName });
    if (!detailFound) throw new DetailNotFoundError({ detailName });

    const isDetailUsed = await this.productRepository.checkDetailUsage({
      detailName,
    });

    if (isDetailUsed) throw new DetailInUseError({ detailName });

    await this.detailRepository.delete({ detailName });
  }

  async run(params: { detailId: string }): Promise<void>;
  async run(params: { detailName: string }): Promise<void>;
  async run(params: deleteParams): Promise<void> {
    const { detailId, detailName } = params;
    if (detailId) return this.deleteById(detailId);
    if (detailName) return this.deleteByName(detailName);
    throw new TypeError("Invalid params");
  }
}
