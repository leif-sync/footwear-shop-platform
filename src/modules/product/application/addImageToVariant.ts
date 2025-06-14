import { AppUrl } from "../../shared/domain/appUrl.js";
import { UUID } from "../../shared/domain/UUID.js";
import { ProductNotFoundError } from "../domain/errors/productNotFoundError.js";
import { VariantNotFoundError } from "../domain/errors/variantNotFoundError.js";
import { ImageUploader } from "../domain/imageUploader.js";
import { ProductRepository } from "../domain/productRepository.js";
import { VariantFull } from "../domain/variantFull.js";
import { AppImage } from "../../shared/domain/AppImage.js";
import { HexColor } from "../../shared/domain/hexColor.js";
import { VariantDetail } from "../domain/variantDetail.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { VariantSize } from "../domain/variantSize.js";
import { Visibility } from "../domain/visibility.js";
import { VariantTag } from "../domain/variantTag.js";

type AddImageToVariantParams = {
  productId: string;
  variantId: string;
  imageBuffer: Buffer;
  imageAlt: string;
};

export class AddImageToVariant {
  private readonly productRepository: ProductRepository;
  private readonly imageUploader: ImageUploader;

  constructor(params: {
    productRepository: ProductRepository;
    imageUploader: ImageUploader;
  }) {
    this.productRepository = params.productRepository;
    this.imageUploader = params.imageUploader;
  }

  private async uploadImage(imageBuffer: Buffer): Promise<AppUrl> {
    return new AppUrl(await this.imageUploader.uploadSingleImage(imageBuffer));
  }

  async run(params: AddImageToVariantParams) {
    const productId = new UUID(params.productId);
    const variantId = new UUID(params.variantId);

    const productFound = await this.productRepository.find({ productId });
    if (!productFound) throw new ProductNotFoundError({ productId });

    const productPrimitives = productFound.toPrimitives();
    const variantFound = productPrimitives.variants.find((variant) =>
      variantId.equals(variant.variantId)
    );
    if (!variantFound) throw new VariantNotFoundError({ variantId });

    const imageUrl = await this.uploadImage(params.imageBuffer);

    const newImage = new AppImage({
      imageUrl,
      imageAlt: params.imageAlt,
    });

    const updatedImages = variantFound.images.map(
      (image) =>
        new AppImage({
          imageUrl: new AppUrl(image.imageUrl),
          imageAlt: image.imageAlt,
        })
    );

    updatedImages.push(newImage);

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
      variantId: new UUID(variantFound.variantId),
      hexColor: new HexColor(variantFound.hexColor),
      images: updatedImages,
      details,
      sizes,
      tags,
      createdAt: variantFound.createdAt,
      updatedAt: new Date(),
      visibility: new Visibility(variantFound.visibility),
    });

    await this.productRepository.updateVariant({
      productId,
      variant: updatedVariant,
    });

    return {
      imageUrl: imageUrl.getValue(),
    };
  }
}
