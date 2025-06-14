import { ProductRepository } from "../../product/domain/productRepository.js";
import { CategoryValidationService as CategoryValidationServicePort } from "../domain/categoryValidationService.js";

export class CategoryValidationService
  implements CategoryValidationServicePort
{
  private readonly productRepository: ProductRepository;

  constructor(params: { productRepository: ProductRepository }) {
    this.productRepository = params.productRepository;
  }

  async checkCategoryUsage(params: { categoryName: string }): Promise<boolean> {
    return this.productRepository.checkCategoryUsage(params);
  }
}
