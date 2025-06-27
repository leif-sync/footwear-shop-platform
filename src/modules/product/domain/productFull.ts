import { UUID } from "../../shared/domain/UUID.js";
import { DuplicatedCategoryError } from "./errors/duplicatedCategoryError.js";
import { DuplicatedVariantError } from "./errors/duplicatedVariantError.js";
import { productConstraint } from "./productConstraints.js";
import { PrimitiveProductPrice, ProductPrice } from "./productPrice.js";
import { PrimitiveVariantFull, VariantFull } from "./variantFull.js";
import { Visibility, visibilityOptions } from "./visibility.js";

type productId = string;

export interface PrimitiveProductFull {
  productId: string;
  name: string;
  description: string;
  price: PrimitiveProductPrice;
  categories: string[];
  variants: PrimitiveVariantFull[];
  visibility: visibilityOptions;
}

export class ProductFull {
  private readonly productId: UUID;
  private readonly name: string;
  private readonly description: string;
  private price: ProductPrice;
  private readonly categories: string[];
  private readonly variants = new Map<productId, VariantFull>();
  private readonly visibility: Visibility;

  constructor(params: {
    productId: UUID;
    name: string;
    description: string;
    price: ProductPrice;
    categories: string[];
    // variants: VariantFull[];
    variants: VariantFull[];
    visibility: Visibility;
  }) {
    const {
      productId,
      name,
      description,
      price,
      categories,
      variants,
      visibility,
    } = params;

    if (!name.length) throw new Error("Name cannot be empty");
    if (!description.length) throw new Error("Description cannot be empty");
    if (!categories.length) throw new Error("Categories cannot be empty");
    if (!variants.length) throw new Error("Variants cannot be empty");

    const categoriesSet = new Set<string>();
    categories.forEach((categoryName) => {
      const isCategoryPresent = categoriesSet.has(categoryName);
      if (isCategoryPresent) {
        throw new DuplicatedCategoryError({ categoryName });
      }
      categoriesSet.add(categoryName);
    });

    if (variants.length < productConstraint.variants.minVariants) {
      throw new Error(
        `There must be at least ${productConstraint.variants.minVariants} variants`
      );
    }

    if (variants.length > productConstraint.variants.maxVariants) {
      throw new Error(
        `There cannot be more than ${productConstraint.variants.maxVariants} variants`
      );
    }

    let isVisibleOneVariant = false;

    variants.forEach((variant) => {
      const variantId = variant.getId();
      const isVariantVisible = variant.getVisibility();
      if (isVariantVisible) isVisibleOneVariant = true;
      const isVariantPresent = this.variants.has(variantId);
      if (isVariantPresent) {
        throw new DuplicatedVariantError({ variantId });
      }
      this.variants.set(variantId, VariantFull.clone(variant));
    });

    if (!isVisibleOneVariant) {
      throw new Error("At least one variant must be visible");
    }

    this.productId = UUID.clone(productId);
    this.name = name;
    this.description = description;
    this.price = ProductPrice.clone(price);
    this.categories = [...categories];
    this.visibility = Visibility.clone(visibility);
  }

  static clone(product: ProductFull) {
    return new ProductFull({
      productId: product.productId,
      name: product.name,
      description: product.description,
      price: product.price,
      categories: product.categories,
      variants: Array.from(product.variants.values()),
      visibility: product.visibility,
    });
  }

  getId() {
    return this.productId.getValue();
  }

  getName() {
    return this.name;
  }

  getDescription() {
    return this.description;
  }

  getCategories() {
    return this.categories.map((category) => category);
  }

  evaluateFinalCost() {
    return this.price.evaluateFinalCost();
  }

  setPrice(params: { newPrice: ProductPrice }) {
    const { newPrice } = params;
    this.price = ProductPrice.clone(newPrice);
  }

  hasVariant(params: { variantId: UUID }) {
    const { variantId } = params;
    return this.variants.has(variantId.getValue());
  }

  setVariantVisibility(params: { variantId: UUID; visibility: Visibility }) {
    const { variantId, visibility } = params;
    const variant = this.variants.get(variantId.getValue());
    if (!variant) throw new Error("Variant not found");
    variant.setVisibility(visibility);
  }

  getVisibility() {
    return this.visibility.getValue();
  }

  toPrimitives() {
    return {
      productId: this.productId.getValue(),
      name: this.name,
      description: this.description,
      price: this.price.toPrimitives(),
      categories: this.categories,
      variants: Array.from(this.variants.values()).map((variant) =>
        variant.toPrimitives()
      ),
      visibility: this.visibility.getValue(),
    };
  }
}
