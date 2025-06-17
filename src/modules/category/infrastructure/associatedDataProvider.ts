import { ProductRepository } from "../../product/domain/productRepository.js";
import { AssociatedDataProvider as AssociatedDataProviderPort } from "../domain/associatedDataProvider.js";
import { CategoryName } from "../domain/categoryName.js";

export class AssociatedDataProvider implements AssociatedDataProviderPort {
  private readonly productRepository: ProductRepository;

  constructor(params: { productRepository: ProductRepository }) {
    this.productRepository = params.productRepository;
  }

  async checkCategoryUsage(params: {
    categoryName: CategoryName;
  }): Promise<boolean> {
    return this.productRepository.checkCategoryUsage({
      categoryName: params.categoryName.getValue(),
    });
  }
}
