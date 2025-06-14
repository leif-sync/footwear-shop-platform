import { ProductRepository } from "../../product/domain/productRepository.js";
import { AssociatedDataProvider as AssociatedDataProviderPort } from "../domain/associatedDataProvider.js";

export class AssociatedDataProvider implements AssociatedDataProviderPort {
  private readonly productRepository: ProductRepository;

  constructor(params: { productRepository: ProductRepository }) {
    this.productRepository = params.productRepository;
  }

  async checkCategoryUsage(params: { categoryName: string }): Promise<boolean> {
    return this.productRepository.checkCategoryUsage(params);
  }
}
