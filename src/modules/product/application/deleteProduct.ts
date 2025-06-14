import { UUID } from "../../shared/domain/UUID.js";
import { ProductAssociatedDataProvider } from "../domain/productAssociatedDataProvider.js";
import { ProductNotFoundError } from "../domain/errors/productNotFoundError.js";
import { ProductPurchaseConflictError } from "../domain/errors/productPurchaseConflictError.js";
import { ProductRepository } from "../domain/productRepository.js";

export class DeleteProduct {
  private readonly productRepository: ProductRepository;
  private readonly productAssociatedDataProvider: ProductAssociatedDataProvider;

  constructor(params: {
    productRepository: ProductRepository;
    productAssociatedDataProvider: ProductAssociatedDataProvider;
  }) {
    this.productRepository = params.productRepository;
    this.productAssociatedDataProvider = params.productAssociatedDataProvider;
  }

  async run(params: { productId: string }) {
    const productId = new UUID(params.productId);

    const product = await this.productRepository.find({
      productId: productId,
    });

    if (!product) throw new ProductNotFoundError({ productId });

    const isProductPurchased =
      await this.productAssociatedDataProvider.checkIfProductPurchased({
        productId,
      });

    if (isProductPurchased)
      throw new ProductPurchaseConflictError({ productId });

    await this.productRepository.deleteProduct({ productId });
  }
}
