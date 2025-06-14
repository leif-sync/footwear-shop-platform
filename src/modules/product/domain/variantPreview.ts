import { AppUrl } from "../../shared/domain/appUrl.js";
import { HexColor } from "../../shared/domain/hexColor.js";
import { AppImage } from "../../shared/domain/AppImage.js";
import { UUID } from "../../shared/domain/UUID.js";
import { VariantFull } from "./variantFull.js";
import { Visibility } from "./visibility.js";

export class VariantPreview {
  private readonly variantId: UUID;
  private readonly hexColor: HexColor;
  private readonly imagePreview: AppImage;
  private readonly visibility: Visibility;

  constructor(params: {
    variantId: UUID;
    hexColor: HexColor;
    imagePreview: AppImage;
    visibility: Visibility;
  }) {
    const { variantId, hexColor, imagePreview, visibility } = params;

    this.variantId = UUID.clone(variantId);
    this.hexColor = HexColor.clone(hexColor);
    this.imagePreview = AppImage.clone(imagePreview);
    this.visibility = Visibility.clone(visibility);
  }

  static clone(variant: VariantPreview) {
    // el constructor se encarga de las copias profundas
    return new VariantPreview({
      variantId: variant.variantId,
      hexColor: variant.hexColor,
      imagePreview: variant.imagePreview,
      visibility: variant.visibility,
    });
  }

  static from(variant: VariantFull) {
    const { variantId, hexColor, images, visibility } = variant.toPrimitives();

    const imagePreview = new AppImage({
      imageUrl: new AppUrl(images[0].imageUrl),
      imageAlt: images[0].imageAlt,
    });

    return new VariantPreview({
      variantId: new UUID(variantId),
      hexColor: new HexColor(hexColor),
      imagePreview,
      visibility: new Visibility(visibility),
    });
  }

  getVariantId() {
    return this.variantId;
  }

  getHexColor() {
    return this.hexColor;
  }

  toPrimitives() {
    return {
      variantId: this.variantId.getValue(),
      hexColor: this.hexColor.getValue(),
      image: this.imagePreview.toPrimitives(),
      visibility: this.visibility.getValue(),
    };
  }
}
