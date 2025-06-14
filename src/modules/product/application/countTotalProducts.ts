import { SmartOmit } from "../../shared/domain/helperTypes.js";
import { ProductRepository } from "../domain/productRepository.js";
import { Visibility } from "../domain/visibility.js";
import type { listProductsParams } from "./listProducts.js";

type countProductsParams = SmartOmit<
  listProductsParams,
  "limit" | "offset" | "variantVisibility"
>;

export class CountTotalProducts {
  private readonly productRepository: ProductRepository;

  constructor(params: { productRepository: ProductRepository }) {
    this.productRepository = params.productRepository;
  }

  async run(params: countProductsParams) {
    const { categories } = params;
    const productVisibility = params.productVisibility
      ? new Visibility(params.productVisibility)
      : undefined;

    const count = await this.productRepository.countProducts({
      categories,
      productVisibility,
    });
    return count.getValue()
  }
}
