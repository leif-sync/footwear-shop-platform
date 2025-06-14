import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { ProductRepository } from "../domain/productRepository.js";
import { Visibility, visibilityOptions } from "../domain/visibility.js";

export type listProductsParams = {
  limit: number;
  offset: number;
  categories?: string[];
  productVisibility?: visibilityOptions;
  variantVisibility?: visibilityOptions;
};

export class ListProducts {
  private readonly productRepository: ProductRepository;

  constructor(params: { productRepository: ProductRepository }) {
    this.productRepository = params.productRepository;
  }

  async run(params: listProductsParams) {
    const limit = new PositiveInteger(params.limit);
    const offset = new NonNegativeInteger(params.offset);
    const categories = params.categories;
    const productVisibility = params.productVisibility
      ? new Visibility(params.productVisibility)
      : undefined;

    const products = await this.productRepository.list({
      limit,
      offset,
      categories,
      productVisibility,
    });

    const productPrimitives = products.map((product) => product.toPrimitives());

    if (!params.variantVisibility) return productPrimitives;

    const filteredProductVariants = productPrimitives.map((product) => {
      const visibleVariants = product.variants.filter(
        (variant) => variant.visibility === params.variantVisibility
      );

      return {
        ...product,
        variants: visibleVariants,
      };
    });

    return filteredProductVariants;
  }
}
