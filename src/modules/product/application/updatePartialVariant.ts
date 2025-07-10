import { AppUrl } from "../../shared/domain/appUrl.js";
import { HexColor } from "../../shared/domain/hexColor.js";
import { AppImage } from "../../shared/domain/AppImage.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { LastVisibleVariantCannotBeHiddenError } from "../domain/errors/lastVisibleVariantCannotBeHiddenError.js";
import { ProductNotFoundError } from "../domain/errors/productNotFoundError.js";
import { VariantNotFoundError } from "../domain/errors/variantNotFoundError.js";
import { ProductRepository } from "../domain/productRepository.js";
import { ProductValidationService } from "../domain/productValidationService.js";
import { VariantDetail } from "../domain/variantDetail.js";
import { VariantFull } from "../domain/variantFull.js";
import { VariantSize } from "../domain/variantSize.js";
import { VariantTag } from "../domain/variantTag.js";
import { Visibility, visibilityOptions } from "../domain/visibility.js";

type UpdatePartialVariantParams = {
  productId: string;
  variant: {
    variantId: string;
    hexColor?: string;
    details?: {
      title: string;
      content: string;
    }[];
    sizes?: {
      sizeValue: number;
      stock: number;
    }[];
    tags?: string[];
    visibility?: visibilityOptions;
  };
};

export class UpdatePartialVariant {
  private readonly productRepository: ProductRepository;
  private readonly productValidationService: ProductValidationService;

  constructor(params: {
    productRepository: ProductRepository;
    productValidationService: ProductValidationService;
  }) {
    this.productRepository = params.productRepository;
    this.productValidationService = params.productValidationService;
  }

  private async ensureDataValidity(params: {
    details?: string[];
    sizes?: number[];
    tags?: string[];
  }) {
    const validationPromises: Promise<void>[] = [];

    if (params.tags) {
      validationPromises.push(
        this.productValidationService.ensureVariantTagValidity(params.tags)
      );
    }
    if (params.details) {
      validationPromises.push(
        this.productValidationService.ensureVariantDetailsValidity(
          params.details
        )
      );
    }
    if (params.sizes) {
      validationPromises.push(
        this.productValidationService.ensureVariantSizeValidity(
          params.sizes.map((size) => new PositiveInteger(size))
        )
      );
    }

    await Promise.all(validationPromises);
  }

  async run(params: UpdatePartialVariantParams) {
    const productId = new UUID(params.productId);
    const variantId = new UUID(params.variant.variantId);

    const productFound = await this.productRepository.find({ productId });
    if (!productFound) throw new ProductNotFoundError({ productId });

    const productPrimitives = productFound.toPrimitives();
    const variantFound = productPrimitives.variants.find((variant) =>
      variantId.equals(variant.variantId)
    );
    if (!variantFound) throw new VariantNotFoundError({ variantId });

    await this.ensureDataValidity({
      details: params.variant.details?.map((detail) => detail.title),
      sizes: params.variant.sizes?.map((size) => size.sizeValue),
      tags: params.variant.tags,
    });

    const variantVisible = productPrimitives.variants.filter(
      (variant) => variant.visibility === visibilityOptions.VISIBLE
    );

    const countVariantsVisible = variantVisible.length;

    if (countVariantsVisible === 1) {
      const variantVisibleFound = variantVisible[0];
      const isCurrentVariantVisible = variantId.equals(
        variantVisibleFound.variantId
      );

      const isNewVariantVisibilityHidden =
        params.variant.visibility === visibilityOptions.HIDDEN;

      const isHidingLastVisibleVariant =
        isCurrentVariantVisible && isNewVariantVisibilityHidden;

      if (isHidingLastVisibleVariant)
        throw new LastVisibleVariantCannotBeHiddenError();
    }

    const primitiveHexColor = params.variant.hexColor ?? variantFound.hexColor;
    const primitiveDetails = params.variant.details ?? variantFound.details;
    const primitiveSizes = params.variant.sizes ?? variantFound.sizes;
    const primitiveTags = params.variant.tags ?? variantFound.tags;

    const primitiveVisibility =
      params.variant.visibility ?? variantFound.visibility;

    const hexColor = new HexColor(primitiveHexColor);
    const details = primitiveDetails.map(
      (detail) =>
        new VariantDetail({
          title: detail.title,
          content: detail.content,
        })
    );
    const sizes = primitiveSizes.map(
      (size) =>
        new VariantSize({
          sizeValue: new PositiveInteger(size.sizeValue),
          stock: new NonNegativeInteger(size.stock),
        })
    );
    const visibility = new Visibility(primitiveVisibility);

    const images = variantFound.images.map(
      (image) =>
        new AppImage({
          imageAlt: image.imageAlt,
          imageUrl: new AppUrl(image.imageUrl),
        })
    );

    const tags = primitiveTags.map((tag) => new VariantTag(tag));

    const updatedVariant = new VariantFull({
      variantId,
      hexColor,
      images,
      details,
      sizes,
      tags,
      createdAt: variantFound.createdAt,
      updatedAt: new Date(),
      visibility,
    });

    await this.productRepository.updateVariant({
      productId,
      variant: updatedVariant,
    });
  }
}
