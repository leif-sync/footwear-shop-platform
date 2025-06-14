import { AppUrl } from "./appUrl.js";

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

    super(`Invalid image alt: ${params.invalidImageAlt}`);
  }
}

export class AppImage {
  private readonly imageUrl: AppUrl;
  private readonly imageAlt: string;

  constructor(params: { imageUrl: AppUrl; imageAlt: string }) {
    const { imageUrl, imageAlt } = params;

    if (!imageAlt.length) throw new Error("Image alt cannot be empty");

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

  toPrimitives() {
    return {
      imageUrl: this.imageUrl.getValue(),
      imageAlt: this.imageAlt,
    };
  }
}
