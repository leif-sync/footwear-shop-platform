import { ProductRepository } from "../../product/domain/productRepository.js";
import { UUID } from "../../shared/domain/UUID.js";
import { DetailInUseError } from "../domain/detailInUseError.js";
import { DetailNotFoundError } from "../domain/detailNotFoundError.js";
import { DetailRepository } from "../domain/detailRepository.js";
import { DetailTitle } from "../domain/detailTitle.js";

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

  private async deleteById(detailId: UUID) {
    const detailFound = await this.detailRepository.find({ detailId });
    if (!detailFound) throw new DetailNotFoundError({ detailId: detailId });

    const detailTitle = detailFound.getTitle();

    const isDetailUsed = await this.productRepository.checkDetailUsage({
      detailTitle: detailTitle.getValue(),
    });

    if (isDetailUsed) throw new DetailInUseError({ detailTitle });

    await this.detailRepository.delete({ detailId });
  }

  private async deleteByTitle(detailTitle: DetailTitle) {
    const detailFound = await this.detailRepository.find({ detailTitle });
    if (!detailFound) throw new DetailNotFoundError({ detailTitle });

    const isDetailUsed = await this.productRepository.checkDetailUsage({
      detailTitle: detailTitle.getValue(),
    });

    if (isDetailUsed) throw new DetailInUseError({ detailTitle });

    await this.detailRepository.delete({ detailTitle });
  }

  /**
   * Deletes a detail by its ID.
   * @param params - The parameters for deleting a detail.
   * @param params.detailId - The ID of the detail to be deleted.
   *
   * @throws {DetailNotFoundError} If the detail with the given ID does not exist.
   * @throws {DetailInUseError} If the detail is currently in use by a product.
   */
  async run(params: { detailId: UUID }): Promise<void>;

  /**
   * Deletes a detail by its name.
   * @param params - The parameters for deleting a detail.
   * @param params.detailTitle - The title of the detail to be deleted.
   *
   * @throws {DetailNotFoundError} If the detail with the given title does not exist.
   * @throws {DetailInUseError} If the detail is currently in use by a product.
   */
  async run(params: { detailTitle: DetailTitle }): Promise<void>;
  async run(
    params: { detailId: UUID } | { detailTitle: DetailTitle }
  ): Promise<void> {
    const isDetailId = "detailId" in params;
    if (isDetailId) return this.deleteById(params.detailId);
    this.deleteByTitle(params.detailTitle);
  }
}
