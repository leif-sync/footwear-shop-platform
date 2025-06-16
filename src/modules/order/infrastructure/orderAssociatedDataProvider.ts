import { ProductRepository } from "../../product/domain/productRepository.js";
import { UUID } from "../../shared/domain/UUID.js";
import { OrderAssociatedDataProvider as OrderAssociatedDataProviderPort } from "../domain/associatedDataProvider.js";
import { AdminRepository } from "../../admin/domain/adminRepository.js";
import { ProductUpdater } from "../domain/productUpdater.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { VariantUpdater } from "../domain/variantUpdater.js";
import { VariantSizesUpdater } from "../domain/variantSizesUpdater.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { Integer } from "../../shared/domain/integer.js";

export class OrderAssociatedDataProvider
  implements OrderAssociatedDataProviderPort
{
  private readonly productRepository: ProductRepository;
  private readonly adminRepository: AdminRepository;

  constructor(params: {
    productRepository: ProductRepository;
    adminRepository: AdminRepository;
  }) {
    this.productRepository = params.productRepository;
    this.adminRepository = params.adminRepository;
  }

  async checkAdminExistence(params: { adminId: UUID }): Promise<boolean> {
    const { adminId } = params;
    const admin = await this.adminRepository.find({ adminId });
    return Boolean(admin);
  }

  async retrieveProductUpdaters(params: { productIds: UUID[] }) {
    const { productIds } = params;
    const products = await this.productRepository.retrievePartialProductDetails(
      {
        productIds,
      }
    );

    return products.map((product) => {
      return new ProductUpdater({
        productId: new UUID(product.productId),
        unitPrice: new PositiveInteger(product.unitPrice),
        variants: product.variants.map(
          (variant) =>
            new VariantUpdater({
              variantId: new UUID(variant.variantId),
              sizes: variant.sizes.map(
                (size) =>
                  new VariantSizesUpdater({
                    sizeValue: new PositiveInteger(size.sizeValue),
                    initialStock: new NonNegativeInteger(size.stock),
                  })
              ),
            })
        ),
      });
    });
  }

  async applyProductUpdaters(params: {
    productUpdaters: ProductUpdater[];
  }): Promise<void> {
    const products = params.productUpdaters.flatMap((product) => {
      const productPrimitives = product.toPrimitives();

      return productPrimitives.variants.flatMap((variant) => {
        return variant.sizes.flatMap((size) => {
          if (size.stockAdjustment === 0) return [];
          return {
            productId: new UUID(productPrimitives.productId),
            variantId: new UUID(variant.variantId),
            size: {
              sizeValue: new PositiveInteger(size.sizeValue),
              stockAdjustment: new Integer(size.stockAdjustment),
            },
          };
        });
      });
    });

    await this.productRepository.modifyStock(products);
  }
}
