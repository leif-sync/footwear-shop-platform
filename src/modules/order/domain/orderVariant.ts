import { HexColor } from "../../shared/domain/hexColor.js";
import { AppImage, PrimitiveAppImage } from "../../shared/domain/AppImage.js";
import { UUID } from "../../shared/domain/UUID.js";
import {
  OrderVariantSize,
  PrimitiveOrderVariantSize,
} from "./orderVariantSize.js";

export interface PrimitiveOrderVariant {
  variantId: string;
  hexColor: string;
  image: PrimitiveAppImage;
  variantSizes: PrimitiveOrderVariantSize[];
}

export class OrderVariant {
  private readonly variantId: UUID;
  private readonly hexColor: HexColor;
  private readonly image: AppImage;
  private readonly variantSizes: OrderVariantSize[];

  constructor(params: {
    variantId: UUID;
    hexColor: HexColor;
    image: AppImage;
    variantSizes: OrderVariantSize[];
  }) {
    this.variantId = UUID.clone(params.variantId);
    this.hexColor = HexColor.clone(params.hexColor);
    this.image = AppImage.clone(params.image);
    this.variantSizes = params.variantSizes.map(OrderVariantSize.clone);
  }

  static clone(variant: OrderVariant): OrderVariant {
    return new OrderVariant({
      variantId: variant.variantId,
      hexColor: variant.hexColor,
      image: variant.image,
      variantSizes: variant.variantSizes,
    });
  }

  getVariantId() {
    return this.variantId.getValue();
  }

  getColorHex() {
    return this.hexColor.getValue();
  }

  getImageUrl() {
    return this.image.getImageUrl();
  }

  getImageAlt() {
    return this.image.getImageAlt();
  }

  toPrimitives(): PrimitiveOrderVariant {
    return {
      variantId: this.variantId.getValue(),
      hexColor: this.hexColor.getValue(),
      image: this.image.toPrimitives(),
      variantSizes: this.variantSizes.map((variantSize) =>
        variantSize.toPrimitives()
      ),
    };
  }
}
