import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { VariantDetail } from "../domain/variantDetail.js";
import { DiscountOptions, DiscountType } from "../domain/discountType.js";
import { ProductPrice } from "../domain/productPrice.js";
import { ImageStorageEngine } from "../domain/imageStorageEngine.js";
import { ProductRepository } from "../domain/productRepository.js";
import { VariantFull } from "../domain/variantFull.js";
import { AppUrl } from "../../shared/domain/appUrl.js";
import { HexColor } from "../../shared/domain/hexColor.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { Visibility, visibilityOptions } from "../domain/visibility.js";
import { ProductFull } from "../domain/productFull.js";
import { VariantSize } from "../domain/variantSize.js";
import { AppImage } from "../../shared/domain/AppImage.js";
import { ProductValidationService } from "../domain/productValidationService.js";
import { VariantTag } from "../domain/variantTag.js";

type variant = {
  hexColor: string;
  images: {
    imageBuffer: Buffer;
    imageAlt: string;
  }[];
  details: {
    title: string;
    content: string;
  }[];
  sizes: {
    sizeValue: number;
    stock: number;
  }[];
  tags: string[];
  visibility: visibilityOptions;
};

type CreateProductParams = {
  productName: string;
  productDescription: string;
  productCategories: string[];
  price: {
    baseValue: number;
    discountType: DiscountOptions;
    discountValue: number;
    discountStartAt: Date | null;
    discountEndAt: Date | null;
  };
  visibility: visibilityOptions;
  variants: variant[];
};

export class CreateProduct {
  private readonly imageUploader: ImageStorageEngine;
  private readonly productRepository: ProductRepository;
  private readonly productValidationService: ProductValidationService;

  constructor(params: {
    imageUploader: ImageStorageEngine;
    productRepository: ProductRepository;
    productValidationService: ProductValidationService;
  }) {
    this.imageUploader = params.imageUploader;
    this.productRepository = params.productRepository;
    this.productValidationService = params.productValidationService;
  }

  private async uploadImagesAndCreateVariants(
    variants: CreateProductParams["variants"]
  ) {
    const productVariantsPromises = variants.map(async (variant) => {
      // format sizes
      const variantSizes = variant.sizes.map((size) => {
        return new VariantSize({
          sizeValue: new PositiveInteger(size.sizeValue),
          stock: new NonNegativeInteger(size.stock),
        });
      });

      // format details
      const variantDetails = variant.details.map((detail) => {
        return new VariantDetail({
          title: detail.title,
          content: detail.content,
        });
      });

      // upload images
      const imageBuffers = variant.images.map((image) => image.imageBuffer);
      const imageUrls =
        await this.imageUploader.uploadMultipleImages(imageBuffers);

      const variantImages = variant.images.map(
        (image, index) =>
          new AppImage({
            imageUrl: new AppUrl(imageUrls[index]),
            imageAlt: image.imageAlt,
          })
      );

      const tags = variant.tags.map((tag) => new VariantTag(tag));

      return new VariantFull({
        variantId: UUID.generateRandomUUID(),
        hexColor: new HexColor(variant.hexColor),
        sizes: variantSizes,
        tags,
        details: variantDetails,
        images: variantImages,
        createdAt: new Date(),
        updatedAt: new Date(),
        visibility: new Visibility(variant.visibility),
      });
    });

    return await Promise.all(productVariantsPromises);
  }

  async run(
    productToCreate: CreateProductParams
  ): Promise<{ productId: string }> {
    const {
      productName,
      productDescription,
      productCategories,
      price,
      variants,
    } = productToCreate;

    const tagNames = variants.flatMap((variant) => variant.tags);
    const sizeValues = variants.flatMap((variant) =>
      variant.sizes.map((size) => new PositiveInteger(size.sizeValue))
    );
    const detailNames = variants.flatMap((variant) =>
      variant.details.map((detail) => detail.title)
    );
    const productId = UUID.generateRandomUUID();

    await Promise.all([
      this.productValidationService.ensureProductCategoryValidity(
        productCategories
      ),
      this.productValidationService.ensureVariantTagValidity(tagNames),
      this.productValidationService.ensureVariantSizeValidity(sizeValues),
      this.productValidationService.ensureVariantDetailsValidity(detailNames),
    ]);

    // create product variants
    const newVariants = await this.uploadImagesAndCreateVariants(variants);

    const newPrice = new ProductPrice({
      baseValue: new PositiveInteger(price.baseValue),
      discountType: new DiscountType(price.discountType),
      discountValue: new NonNegativeInteger(price.discountValue),
      discountStartAt: price.discountStartAt,
      discountEndAt: price.discountEndAt,
    });

    const product = new ProductFull({
      productId,
      name: productName,
      description: productDescription,
      categories: productCategories,
      price: newPrice,
      variants: newVariants,
      visibility: new Visibility(productToCreate.visibility),
    });

    await this.productRepository.create({ product });

    return {
      productId: productId.getValue(),
    };
  }
}
