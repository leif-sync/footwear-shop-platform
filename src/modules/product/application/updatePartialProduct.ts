import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { DiscountOptions, DiscountType } from "../domain/discountType.js";
import { ProductNotFoundError } from "../domain/errors/productNotFoundError.js";
import { ProductPrice } from "../domain/productPrice.js";
import { ProductRepository } from "../domain/productRepository.js";
import { ProductValidationService } from "../domain/productValidationService.js";
import { Visibility, visibilityOptions } from "../domain/visibility.js";

type UpdatePartialProductParams = {
  productId: string;
  productName?: string;
  productDescription?: string;
  productCategories?: string[];
  price?: {
    baseValue: number;
    discountType: DiscountOptions;
    discountValue: number;
    discountStartAt: Date | null;
    discountEndAt: Date | null;
  };
  productVisibility?: visibilityOptions;
};

export class UpdatePartialProduct {
  private readonly productRepository: ProductRepository;
  private readonly productValidationService: ProductValidationService;

  constructor(params: {
    productRepository: ProductRepository;
    productValidationService: ProductValidationService;
  }) {
    this.productRepository = params.productRepository;
    this.productValidationService = params.productValidationService;
  }

  async run(productToUpdate: UpdatePartialProductParams) {
    const productId = new UUID(productToUpdate.productId);

    const productFound = await this.productRepository.find({ productId });
    if (!productFound) throw new ProductNotFoundError({ productId });

    const productFoundPrimitives = productFound.toPrimitives();

    if (productToUpdate.productCategories) {
      await this.productValidationService.ensureProductCategoryValidity(
        productToUpdate.productCategories
      );
    }

    const validCategories = productToUpdate.productCategories
      ? productToUpdate.productCategories
      : productFoundPrimitives.categories;

    const { price: productPrice } = productToUpdate;

    const newPrice = productPrice
      ? new ProductPrice({
          baseValue: new PositiveInteger(productPrice.baseValue),
          discountType: new DiscountType(productPrice.discountType),
          discountValue: new NonNegativeInteger(productPrice.discountValue),
          discountStartAt: productPrice.discountStartAt,
          discountEndAt: productPrice.discountEndAt,
        })
      : new ProductPrice({
          baseValue: new PositiveInteger(
            productFoundPrimitives.price.baseValue
          ),
          discountType: new DiscountType(
            productFoundPrimitives.price.discountType
          ),
          discountValue: new NonNegativeInteger(
            productFoundPrimitives.price.discountValue
          ),
          discountStartAt: productFoundPrimitives.price.discountStartAt,
          discountEndAt: productFoundPrimitives.price.discountEndAt,
        });

    const productVisibility = new Visibility(
      productToUpdate.productVisibility ?? productFoundPrimitives.visibility
    );

    await this.productRepository.updatePartialProduct({
      productId,
      productName: productToUpdate.productName ?? productFoundPrimitives.name,
      productDescription:
        productToUpdate.productDescription ??
        productFoundPrimitives.description,
      productCategories: validCategories,
      productPrice: newPrice,
      productVisibility,
    });
  }
}
