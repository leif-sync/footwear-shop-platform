import { UUID } from "../../shared/domain/UUID.js";
import { VariantDetail } from "./variantDetail.js";
import { HexColor } from "../../shared/domain/hexColor.js";
import { Visibility, visibilityOptions } from "./visibility.js";
import { VariantSize } from "./variantSize.js";
import { AppImage } from "../../shared/domain/AppImage.js";
import { variantConstraint } from "./variantConstraints.js";
import { VariantTag } from "./variantTag.js";

export type VariantFullPrimitives = {
  variantId: string;
  hexColor: string;
  images: {
    imageUrl: string;
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
  createdAt: Date;
  updatedAt: Date;
  visibility: visibilityOptions;
};

type sizeValue = number;

export class VariantFull {
  private readonly variantId: UUID;
  private readonly hexColor: HexColor;
  private readonly images: AppImage[];
  private readonly details: VariantDetail[];
  private readonly sizes = new Map<sizeValue, VariantSize>();
  private readonly tags: VariantTag[];
  private readonly createdAt: Date;
  private readonly updatedAt: Date;
  private visibility: Visibility;

  constructor(params: {
    variantId: UUID;
    hexColor: HexColor;
    images: AppImage[];
    details: VariantDetail[];
    sizes: VariantSize[];
    tags: VariantTag[];
    createdAt: Date;
    updatedAt: Date;
    visibility: Visibility;
  }) {
    const { tags, sizes, details } = params;
    this.variantId = UUID.clone(params.variantId);
    this.hexColor = HexColor.clone(params.hexColor);
    this.images = params.images.map(AppImage.clone);
    this.details = details.map(VariantDetail.clone);
    this.tags = tags.map(VariantTag.clone);
    this.createdAt = new Date(params.createdAt);
    this.updatedAt = new Date(params.updatedAt);
    this.visibility = Visibility.clone(params.visibility);

    sizes.forEach((size) => {
      const sizeValue = size.getSizeValue();
      const isSizePresent = this.sizes.has(sizeValue);
      if (isSizePresent) throw new Error("Sizes cannot have repeated values");
      this.sizes.set(sizeValue, VariantSize.clone(size));
    });

    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.images.length < variantConstraint.image.minImages) {
      throw new Error(
        `Images cannot be less than ${variantConstraint.image.minImages}`
      );
    }
    if (this.images.length > variantConstraint.image.maxImages) {
      throw new Error(
        `Images cannot be greater than ${variantConstraint.image.maxImages}`
      );
    }
    const sizes = Array.from(this.sizes.values());
    if (sizes.length < variantConstraint.size.minSizes) {
      throw new Error(
        `Sizes cannot be less than ${variantConstraint.size.minSizes}`
      );
    }
    if (sizes.length > variantConstraint.size.maxSizes) {
      throw new Error(
        `Sizes cannot be greater than ${variantConstraint.size.maxSizes}`
      );
    }
    if (this.tags.length < variantConstraint.tag.minTags) {
      throw new Error(
        `Tags cannot be less than ${variantConstraint.tag.minTags}`
      );
    }
    if (this.tags.length > variantConstraint.tag.maxTags) {
      throw new Error(
        `Tags cannot be greater than ${variantConstraint.tag.maxTags}`
      );
    }
    if (this.details.length < variantConstraint.detail.minDetails) {
      throw new Error(
        `Details cannot be less than ${variantConstraint.detail.minDetails}`
      );
    }
    if (this.details.length > variantConstraint.detail.maxDetails) {
      throw new Error(
        `Details cannot be greater than ${variantConstraint.detail.maxDetails}`
      );
    }
  }

  static clone(productVariant: VariantFull) {
    // el constructor se encarga de las copias profundas
    return new VariantFull({
      variantId: productVariant.variantId,
      hexColor: productVariant.hexColor,
      images: productVariant.images,
      details: productVariant.details,
      sizes: Array.from(productVariant.sizes.values()),
      tags: productVariant.tags,
      createdAt: productVariant.createdAt,
      updatedAt: productVariant.updatedAt,
      visibility: productVariant.visibility,
    });
  }

  getId() {
    return this.variantId.getValue();
  }

  getVisibility() {
    return this.visibility.getValue();
  }

  setVisibility(visibility: Visibility) {
    this.visibility = Visibility.clone(visibility);
  }

  deleteImage(imageUrl: string) {
    const imageIndex = this.images.findIndex(
      (image) => image.getImageUrl() === imageUrl
    );
    if (imageIndex === -1) throw new Error("Image not found");
    this.images.splice(imageIndex, 1);
  }

  toPrimitives(): VariantFullPrimitives {
    return {
      variantId: this.variantId.getValue(),
      hexColor: this.hexColor.getValue(),
      images: this.images.map((image) => image.toPrimitives()),
      details: this.details.map((detail) => detail.toPrimitives()),
      sizes: Array.from(this.sizes.values()).map((size) => size.toPrimitives()),
      tags: this.tags.map((tag) => tag.getValue()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      visibility: this.visibility.getValue(),
    };
  }
}
