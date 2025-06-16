import { ProductRepository } from "../../product/domain/productRepository.js";
import { UUID } from "../../shared/domain/UUID.js";
import { DetailInUseError } from "../domain/detailInUseError.js";
import { DetailNotFoundError } from "../domain/detailNotFoundError.js";
import { DetailRepository } from "../domain/detailRepository.js";

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

  /**
   * Deletes a detail by its ID.
   * @param params - The parameters for deleting a detail.
   * @param params.detailId - The ID of the detail to be deleted.
   *
   * @throws {DetailNotFoundError} If the detail with the given ID does not exist.
   * @throws {DetailInUseError} If the detail is currently in use by a product.
   */
  async run(params: { detailId: string }): Promise<void>;

  /**
   * Deletes a detail by its name.
   * @param params - The parameters for deleting a detail.
   * @param params.detailName - The name of the detail to be deleted.
   *
   * @throws {DetailNotFoundError} If the detail with the given name does not exist.
   * @throws {DetailInUseError} If the detail is currently in use by a product.
   */
  async run(params: { detailName: string }): Promise<void>;
  async run(
    params: { detailId: string } | { detailName: string }
  ): Promise<void> {
    const isDetailId = "detailId" in params;
    if (isDetailId) return this.deleteById(params.detailId);
    this.deleteByName(params.detailName);
  }
}
