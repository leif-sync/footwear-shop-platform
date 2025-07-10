import { AppUrl } from "./appUrl.js";

export interface PrimitiveAppImage {
  imageUrl: string;
  imageAlt: string;
}

export class AppImageError extends Error {
  constructor(params: { invalidImageAlt: string });
  constructor(params: { invalidImageUrl: string });

  constructor(
    params: { invalidImageAlt: string } | { invalidImageUrl: string }
  ) {
    const isInvalidUrl = "invalidImageUrl" in params;

    if (isInvalidUrl) {
      super(`Invalid image URL: ${params.invalidImageUrl}`);
      return;
    }

    super(
      `Invalid image alt: ${params.invalidImageAlt}, it must be between ${
        AppImage.minImageAltLength
      } and ${AppImage.maxImageAltLength} characters long.`
    );
  }
}

export class AppImage {
  static readonly minImageAltLength: 1;
  static readonly maxImageAltLength: 50;

  private readonly imageUrl: AppUrl;
  private readonly imageAlt: string;

  constructor(params: { imageUrl: AppUrl; imageAlt: string }) {
    const { imageUrl, imageAlt } = params;

    if (imageAlt.length < AppImage.minImageAltLength) {
      throw new AppImageError({ invalidImageAlt: imageAlt });
    }

    if (imageAlt.length > AppImage.maxImageAltLength) {
      throw new AppImageError({ invalidImageAlt: imageAlt });
    }

    this.imageUrl = AppUrl.clone(imageUrl);
    this.imageAlt = imageAlt;
  }

  static clone(image: AppImage) {
    // el constructor se encarga de las copias profundas
    return new AppImage({
      imageUrl: image.imageUrl,
      imageAlt: image.imageAlt,
    });
  }

  getImageUrl() {
    return this.imageUrl.getValue();
  }

  getImageAlt() {
    return this.imageAlt;
  }

  toPrimitives(): PrimitiveAppImage {
    return {
      imageUrl: this.imageUrl.getValue(),
      imageAlt: this.imageAlt,
    };
  }
}
