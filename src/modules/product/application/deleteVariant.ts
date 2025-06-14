import { UUID } from "../../shared/domain/UUID.js";
import { ProductAssociatedDataProvider } from "../domain/productAssociatedDataProvider.js";
import { ProductNotFoundError } from "../domain/errors/productNotFoundError.js";
import { VariantPurchaseConflictError } from "../domain/errors/variantPurchaseConflictError.js";
import { ProductRepository } from "../domain/productRepository.js";
import { VariantNotFoundError } from "../domain/errors/variantNotFoundError.js";
import { AtLeastOneVariantRequiredError } from "../domain/errors/AtLeastOneVariantRequiredError.js";

export class DeleteVariant {
  private readonly productRepository: ProductRepository;
  private readonly productAssociatedDataProvider: ProductAssociatedDataProvider;

  constructor(params: {
    productRepository: ProductRepository;
    productAssociatedDataProvider: ProductAssociatedDataProvider;
  }) {
    this.productRepository = params.productRepository;
    this.productAssociatedDataProvider = params.productAssociatedDataProvider;
  }

  async run(params: { productId: string; variantId: string }) {
    const productId = new UUID(params.productId);
    const variantId = new UUID(params.variantId);

    const product = await this.productRepository.find({
      productId: productId,
    });

    if (!product) throw new ProductNotFoundError({ productId });

    const isVariantPresent = product
      .toPrimitives()
      .variants.some((variant) => variantId.equals(variant.variantId));

    if (!isVariantPresent) throw new VariantNotFoundError({ variantId });

    const isVariantPurchased =
      await this.productAssociatedDataProvider.checkIfVariantPurchased({
        productId,
        variantId,
      });

    if (isVariantPurchased) {
      throw new VariantPurchaseConflictError({
        productId,
        variantId,
      });
    }

    const isUniqueVariant = product.toPrimitives().variants.length === 1;

    if (isUniqueVariant) throw new AtLeastOneVariantRequiredError();

    await this.productRepository.deleteVariant({ productId, variantId });
  }
}
