import { ProductRepository } from "../../product/domain/productRepository.js";
import { TagValidationService as TagValidationServicePort } from "../domain/tagValidationsService.js";

export class TagValidationService implements TagValidationServicePort {
  private productRepository: ProductRepository;

  constructor(params: { productRepository: ProductRepository }) {
    this.productRepository = params.productRepository;
  }

  checkTagUsage(params: { tagName: string }): Promise<boolean> {
    return this.productRepository.checkTagUsage(params);
  }
}
