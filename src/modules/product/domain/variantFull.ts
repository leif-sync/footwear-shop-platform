import { UUID } from "../../shared/domain/UUID.js";
import { PrimitiveVariantDetail, VariantDetail } from "./variantDetail.js";
import { HexColor } from "../../shared/domain/hexColor.js";
import { Visibility, visibilityOptions } from "./visibility.js";
import { PrimitiveVariantSize, VariantSize } from "./variantSize.js";
import { AppImage, PrimitiveAppImage } from "../../shared/domain/AppImage.js";
import { VariantTag } from "./variantTag.js";

export type PrimitiveVariantFull = {
  variantId: string;
  hexColor: string;
  images: PrimitiveAppImage[];
  details: PrimitiveVariantDetail[];
  sizes: PrimitiveVariantSize[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  visibility: visibilityOptions;
};

type sizeValue = number;

export class VariantFull {
  static readonly imageConstraint = {
    maxImages: 8,
    minImages: 2,
    maxFileSizeBytes: 2 * 1024 * 1024,
  };
  static readonly tagConstraint = {
    minTags: 1,
    maxTags: 15,
  };
  static readonly detailConstraint = {
    minDetails: 1,
    maxDetails: 20,
  };
  static readonly sizeConstraint = {
    minSizes: 1,
    maxSizes: 10,
  };

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
    if (this.images.length < VariantFull.imageConstraint.minImages) {
      throw new Error(
        `Images cannot be less than ${VariantFull.imageConstraint.minImages}`
      );
    }
    if (this.images.length > VariantFull.imageConstraint.maxImages) {
      throw new Error(
        `Images cannot be greater than ${VariantFull.imageConstraint.maxImages}`
      );
    }
    const sizes = Array.from(this.sizes.values());
    if (sizes.length < VariantFull.sizeConstraint.minSizes) {
      throw new Error(
        `Sizes cannot be less than ${VariantFull.sizeConstraint.minSizes}`
      );
    }
    if (sizes.length > VariantFull.sizeConstraint.maxSizes) {
      throw new Error(
        `Sizes cannot be greater than ${VariantFull.sizeConstraint.maxSizes}`
      );
    }
    if (this.tags.length < VariantFull.tagConstraint.minTags) {
      throw new Error(
        `Tags cannot be less than ${VariantFull.tagConstraint.minTags}`
      );
    }
    if (this.tags.length > VariantFull.tagConstraint.maxTags) {
      throw new Error(
        `Tags cannot be greater than ${VariantFull.tagConstraint.maxTags}`
      );
    }
    if (this.details.length < VariantFull.detailConstraint.minDetails) {
      throw new Error(
        `Details cannot be less than ${VariantFull.detailConstraint.minDetails}`
      );
    }
    if (this.details.length > VariantFull.detailConstraint.maxDetails) {
      throw new Error(
        `Details cannot be greater than ${VariantFull.detailConstraint.maxDetails}`
      );
    }
  }

  static clone(productVariant: VariantFull) {
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

  toPrimitives(): PrimitiveVariantFull {
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
