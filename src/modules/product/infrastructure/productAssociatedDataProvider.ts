import { CategoryName } from "../../category/domain/categoryName.js";
import { CategoryRepository } from "../../category/domain/categoryRepository.js";
import { DetailRepository } from "../../detail/domain/detailRepository.js";
import { DetailTitle } from "../../detail/domain/detailTitle.js";
import { OrderRepository } from "../../order/domain/orderRepository.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { SizeRepository } from "../../size/domain/sizeRepository.js";
import { TagRepository } from "../../tag/domain/tagRepository.js";
import { ProductAssociatedDataProvider as ProductAssociatedDataProviderPort } from "../domain/productAssociatedDataProvider.js";

export class ProductAssociatedDataProvider
  implements ProductAssociatedDataProviderPort
{
  private readonly categoryRepository: CategoryRepository;
  private readonly detailRepository: DetailRepository;
  private readonly sizeRepository: SizeRepository;
  private readonly tagRepository: TagRepository;
  private readonly orderRepository: OrderRepository;

  constructor(params: {
    categoryRepository: CategoryRepository;
    detailRepository: DetailRepository;
    sizeRepository: SizeRepository;
    tagRepository: TagRepository;
    orderRepository: OrderRepository;
  }) {
    this.categoryRepository = params.categoryRepository;
    this.detailRepository = params.detailRepository;
    this.sizeRepository = params.sizeRepository;
    this.tagRepository = params.tagRepository;
    this.orderRepository = params.orderRepository;
  }

  async retrieveCategoriesByName(
    categoryName: string | string[]
  ): Promise<string[]> {
    const categoryNames = Array.isArray(categoryName)
      ? categoryName.map((name) => new CategoryName(name))
      : [new CategoryName(categoryName)];

    const categories =
      await this.categoryRepository.retrieveCategoriesByName(categoryNames);

    return categories.map((category) => category.toPrimitives().categoryName);
  }

  async retrieveDetailsByTitle(
    detailTitle: string | string[]
  ): Promise<string[]> {
    const detailNames = Array.isArray(detailTitle)
      ? detailTitle.map((title) => new DetailTitle(title))
      : [new DetailTitle(detailTitle)];

    const details =
      await this.detailRepository.retrieveDetailsByTitle(detailNames);

    return details.map((detail) => detail.toPrimitives().detailTitle);
  }

  async retrieveSizesByValue(
    sizeValue: PositiveInteger | PositiveInteger[]
  ): Promise<number[]> {
    const sizeValues = Array.isArray(sizeValue) ? sizeValue : [sizeValue];

    const sizes = await this.sizeRepository.retrieveSizesByValue(sizeValues);

    return sizes.map((size) => size.toPrimitives().sizeValue);
  }

  async retrieveTagsByName(tagName: string | string[]): Promise<string[]> {
    const tagNames = Array.isArray(tagName) ? tagName : [tagName];

    const tags = await this.tagRepository.retrieveTagsByNames(tagNames);

    return tags.map((tag) => tag.toPrimitives().tagName);
  }

  async checkIfProductPurchased(params: { productId: UUID }): Promise<boolean> {
    return this.orderRepository.checkIfProductIsBought(params);
  }

  async checkIfVariantPurchased(params: {
    productId: UUID;
    variantId: UUID;
  }): Promise<boolean> {
    return this.orderRepository.checkIfVariantIsBought(params);
  }
}
