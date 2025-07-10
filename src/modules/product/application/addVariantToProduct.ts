import { HexColor } from "../../shared/domain/hexColor.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { ProductRepository } from "../domain/productRepository.js";
import { VariantDetail } from "../domain/variantDetail.js";
import { VariantFull } from "../domain/variantFull.js";
import { VariantSize } from "../domain/variantSize.js";
import { Visibility, visibilityOptions } from "../domain/visibility.js";
import { AppImage } from "../../shared/domain/AppImage.js";
import { AppUrl } from "../../shared/domain/appUrl.js";
import { ImageStorageEngine } from "../domain/imageStorageEngine.js";
import { ProductValidationService } from "../domain/productValidationService.js";
import { ProductNotFoundError } from "../domain/errors/productNotFoundError.js";
import { VariantTag } from "../domain/variantTag.js";

type AddVariantToProductParams = {
  productId: string;
  variant: {
    hexColor: string;
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
    images: {
      imageBuffer: Buffer;
      imageAlt: string;
    }[];
  };
};

export class AddVariantToProduct {
  private readonly productRepository: ProductRepository;
  private readonly imageUploader: ImageStorageEngine;
  private readonly productValidationService: ProductValidationService;

  constructor(params: {
    productRepository: ProductRepository;
    imageUploader: ImageStorageEngine;
    productValidationService: ProductValidationService;
  }) {
    this.productRepository = params.productRepository;
    this.imageUploader = params.imageUploader;
    this.productValidationService = params.productValidationService;
  }

  private async uploadImages(
    images: { imageBuffer: Buffer; imageAlt: string }[]
  ): Promise<string[]> {
    const imageBuffers = images.map((image) => image.imageBuffer);
    return await this.imageUploader.uploadMultipleImages(imageBuffers);
  }

  private async ensureDataValidity(params: {
    details: string[];
    sizes: number[];
    tags: string[];
  }) {
    await Promise.all([
      this.productValidationService.ensureVariantTagValidity(params.tags),
      this.productValidationService.ensureVariantDetailsValidity(
        params.details
      ),
      this.productValidationService.ensureVariantSizeValidity(
        params.sizes.map((size) => new PositiveInteger(size))
      ),
    ]);
  }

  async run(params: AddVariantToProductParams) {
    const productId = new UUID(params.productId);

    const productFound = await this.productRepository.find({
      productId,
    });

    if (!productFound) throw new ProductNotFoundError({ productId });

    const detailsTitles = params.variant.details.map((detail) => detail.title);
    const sizesValues = params.variant.sizes.map((size) => size.sizeValue);

    await this.ensureDataValidity({
      details: detailsTitles,
      sizes: sizesValues,
      tags: params.variant.tags,
    });

    const details = params.variant.details.map(
      (detail) =>
        new VariantDetail({
          title: detail.title,
          content: detail.content,
        })
    );

    const sizes = params.variant.sizes.map(
      (size) =>
        new VariantSize({
          sizeValue: new PositiveInteger(size.sizeValue),
          stock: new NonNegativeInteger(size.stock),
        })
    );

    const imageUrls = await this.uploadImages(params.variant.images);

    const images = params.variant.images.map(
      (image, index) =>
        new AppImage({
          imageUrl: new AppUrl(imageUrls[index]),
          imageAlt: image.imageAlt,
        })
    );

    const tags = params.variant.tags.map((tag) => new VariantTag(tag));

    const variantId = UUID.generateRandomUUID();

    const variant = new VariantFull({
      createdAt: new Date(),
      updatedAt: new Date(),
      variantId,
      details,
      hexColor: new HexColor(params.variant.hexColor),
      tags,
      visibility: new Visibility(params.variant.visibility),
      sizes,
      images,
    });

    await this.productRepository.addVariantToProduct({
      productId,
      variant,
    });

    return variant.toPrimitives();
  }
}
