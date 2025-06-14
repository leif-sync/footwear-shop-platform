import { UUID } from "../../shared/domain/UUID.js";
import { ProductNotFoundError } from "../domain/errors/productNotFoundError.js";
import { ProductRepository } from "../domain/productRepository.js";
import { visibilityOptions } from "../domain/visibility.js";

export class GetProduct {
  private readonly productRepository: ProductRepository;

  constructor(params: { productRepository: ProductRepository }) {
    this.productRepository = params.productRepository;
  }

  async run(params: {
    productId: string;
    productVisibility?: visibilityOptions;
    variantsVisibility?: visibilityOptions;
  }) {
    const { productVisibility, variantsVisibility } = params;
    const productId = new UUID(params.productId);
    const product = await this.productRepository.find({ productId });
    if (!product) throw new ProductNotFoundError({ productId });

    const productPrimitives = product.toPrimitives();

    if (productVisibility && productVisibility !== product.getVisibility()) {
      throw new ProductNotFoundError({ productId });
    }

    if (variantsVisibility) {
      const { variants, ...restOfProduct } = productPrimitives;
      const validVariants = variants.filter(
        ({ visibility }) => visibility === variantsVisibility
      );

      return {
        ...restOfProduct,
        variants: validVariants,
      };
    }

    return productPrimitives;
  }
}
