import { UUID } from "../../shared/domain/UUID.js";
import { ProductPrice } from "./productPrice.js";
import { VariantPreview } from "./variantPreview.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { ProductFull } from "./productFull.js";
import { DiscountType } from "./discountType.js";
import { AppUrl } from "../../shared/domain/appUrl.js";
import { HexColor } from "../../shared/domain/hexColor.js";
import { AppImage } from "../../shared/domain/AppImage.js";
import { productConstraint } from "./productConstraints.js";
import { Visibility } from "./visibility.js";

export class ProductPreview {
  private readonly productId: UUID;
  private readonly name: string;
  private readonly price: ProductPrice;
  private readonly variants: VariantPreview[];
  private readonly visibility: Visibility;

  constructor(params: {
    productId: UUID;
    name: string;
    price: ProductPrice;
    variants: VariantPreview[];
    visibility: Visibility;
  }) {
    const { productId, name, price, variants, visibility } = params;
    if (!name.length) throw new Error("Name cannot be empty");

    this.productId = UUID.clone(productId);
    this.name = name;
    this.price = ProductPrice.clone(price);
    this.variants = variants.map(VariantPreview.clone);
    this.visibility = Visibility.clone(visibility);
    this.ensureIsValid();
  }

  private ensureIsValid() {
    const { variants } = this;
    const { maxVariants, minVariants } = productConstraint.variants;

    if (variants.length < minVariants || variants.length > maxVariants) {
      throw new Error(
        `Variants length must be between ${minVariants} and ${maxVariants}`
      );
    }
  }

  static from(product: ProductFull) {
    const {
      price: pricePrimitives,
      variants: variantsPrimitives,
      visibility,
    } = product.toPrimitives();

    const price = new ProductPrice({
      baseValue: new PositiveInteger(pricePrimitives.baseValue),
      discountType: new DiscountType(pricePrimitives.discountType),
      discountValue: new NonNegativeInteger(pricePrimitives.discountValue),
      discountStartAt: pricePrimitives.discountStartAt,
      discountEndAt: pricePrimitives.discountEndAt,
    });

    const variants = variantsPrimitives.map((variant) => {
      const imagePreview = new AppImage({
        imageUrl: new AppUrl(variant.images[0].imageUrl),
        imageAlt: variant.images[0].imageAlt,
      });

      return new VariantPreview({
        hexColor: new HexColor(variant.hexColor),
        imagePreview,
        variantId: new UUID(variant.variantId),
        visibility: new Visibility(variant.visibility),
      });
    });

    return new ProductPreview({
      productId: new UUID(product.getId()),
      name: product.getName(),
      price,
      variants,
      visibility: new Visibility(visibility),
    });
  }

  getId() {
    return this.productId.getValue();
  }

  getName() {
    return this.name;
  }

  getFinalValue() {
    return this.price.evaluateFinalCost();
  }

  toPrimitives() {
    return {
      productId: this.productId.getValue(),
      name: this.name,
      price: this.price.toPrimitives(),
      variants: this.variants.map((variant) => variant.toPrimitives()),
      visibility: this.visibility.getValue(),
    };
  }
}
