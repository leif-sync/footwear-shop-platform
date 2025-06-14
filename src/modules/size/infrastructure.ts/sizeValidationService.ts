import { ProductRepository } from "../../product/domain/productRepository.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { SizeValidationService as SizeValidationServicePort } from "../domain/sizeValidationService.js";

export class SizeValidationService implements SizeValidationServicePort {
  private readonly productRepository: ProductRepository;

  constructor(params: { productRepository: ProductRepository }) {
    this.productRepository = params.productRepository;
  }

  async checkSizeUsage(params: {
    sizeValue: PositiveInteger;
  }): Promise<boolean> {
    return await this.productRepository.checkSizeUsage(params);
  }
}
