import { UUID } from "../../shared/domain/UUID.js";
import { ProductNotFoundError } from "../domain/errors/productNotFoundError.js";
import { VariantNotFoundError } from "../domain/errors/variantNotFoundError.js";
import { ProductRepository } from "../domain/productRepository.js";
import { VariantFull } from "../domain/variantFull.js";
import { AppImage } from "../../shared/domain/AppImage.js";
import { AppUrl } from "../../shared/domain/appUrl.js";
import { HexColor } from "../../shared/domain/hexColor.js";
import { VariantDetail } from "../domain/variantDetail.js";
import { VariantSize } from "../domain/variantSize.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { Visibility } from "../domain/visibility.js";
import { ImageStorageEngine } from "../domain/imageStorageEngine.js";
import { VariantImageNotFoundError } from "../domain/errors/variantImageNotFoundError.js";
import { VariantImageConstraintError } from "../domain/errors/variantImageConstraintError.js";
import { VariantTag } from "../domain/variantTag.js";

type DeleteImageFromVariantParams = {
  productId: string;
  variantId: string;
  imageId: string;
};

export class DeleteImageFromVariant {
  private readonly productRepository: ProductRepository;
  private readonly imageUploader: ImageStorageEngine;

  constructor(params: {
    productRepository: ProductRepository;
    imageUploader: ImageStorageEngine;
  }) {
    this.productRepository = params.productRepository;
    this.imageUploader = params.imageUploader;
  }

  async run(params: DeleteImageFromVariantParams) {
    const productId = new UUID(params.productId);
    const variantId = new UUID(params.variantId);

    const productFound = await this.productRepository.find({ productId });
    if (!productFound) throw new ProductNotFoundError({ productId });

    const productPrimitives = productFound.toPrimitives();

    const variantFound = productPrimitives.variants.find((variant) =>
      variantId.equals(variant.variantId)
    );
    if (!variantFound) throw new VariantNotFoundError({ variantId });

    const imageIds = variantFound.images.map(
      (image) => image.imageUrl.split("/").pop()?.split(".").shift() ?? ""
    );

    const imageIdFound = imageIds.find((imageId) => imageId === params.imageId);

    if (!imageIdFound) {
      throw new VariantImageNotFoundError({
        imageId: params.imageId,
        variantId,
      });
    }

    const updatedImagesPrimitives = variantFound.images.filter((image) => {
      const imageUrlId = image.imageUrl.split("/").pop()?.split(".").shift();
      return imageUrlId !== imageIdFound;
    });

    if (updatedImagesPrimitives.length < VariantFull.imageConstraint.minImages) {
      throw new VariantImageConstraintError({
        variantId,
      });
    }

    await this.imageUploader.deleteImage(imageIdFound);

    const updatedImages = updatedImagesPrimitives.map(
      (image) =>
        new AppImage({
          imageUrl: new AppUrl(image.imageUrl),
          imageAlt: image.imageAlt,
        })
    );

    const details = variantFound.details.map(
      (detail) =>
        new VariantDetail({
          title: detail.title,
          content: detail.content,
        })
    );

    const sizes = variantFound.sizes.map(
      (size) =>
        new VariantSize({
          sizeValue: new PositiveInteger(size.sizeValue),
          stock: new NonNegativeInteger(size.stock),
        })
    );

    const tags = variantFound.tags.map((tag) => new VariantTag(tag));

    const updatedVariant = new VariantFull({
      variantId,
      images: updatedImages,
      hexColor: new HexColor(variantFound.hexColor),
      details,
      sizes,
      createdAt: variantFound.createdAt,
      updatedAt: new Date(),
      tags,
      visibility: new Visibility(variantFound.visibility),
    });

    await this.productRepository.updateVariant({
      productId,
      variant: updatedVariant,
    });
  }
}
