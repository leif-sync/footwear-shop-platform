import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import {
  countProductsParams,
  ProductRepository,
} from "../domain/productRepository.js";
import { Specification } from "../../shared/domain/specification.js";
import { Visibility } from "../domain/visibility.js";
import { VariantFull, PrimitiveVariantFull } from "../domain/variantFull.js";
import { VariantDetail } from "../domain/variantDetail.js";
import { AppUrl } from "../../shared/domain/appUrl.js";
import { ProductPrice } from "../domain/productPrice.js";
import { DiscountType } from "../domain/discountType.js";
import { HexColor } from "../../shared/domain/hexColor.js";
import { ProductPreview } from "../domain/productPreview.js";
import { ProductFull } from "../domain/productFull.js";
import { VariantSize } from "../domain/variantSize.js";
import { AppImage } from "../../shared/domain/AppImage.js";
import { partialProductDetailsDto } from "../domain/dto/partialProductDetails.js";
import { ProductNotFoundError } from "../domain/errors/productNotFoundError.js";
import { VariantNotFoundError } from "../domain/errors/variantNotFoundError.js";
import { VariantTag } from "../domain/variantTag.js";
import { Integer } from "../../shared/domain/integer.js";

function categoryFilter(categories: string[]) {
  const filterCondition = (product: ProductFull) => {
    return categories.some((category) =>
      product.getCategories().includes(category)
    );
  };

  return filterCondition;
}

function productVisibilityFilter(visibility: Visibility) {
  const filterCondition = (product: ProductFull) => {
    return visibility.equals(product.toPrimitives().visibility);
  };

  return filterCondition;
}

function productIdFilter(ids: UUID[]) {
  const filterCondition = (product: ProductFull) => {
    return ids.some((id) => id.equals(product.getId()));
  };

  return filterCondition;
}

// ? esto podría ser un método de la clase Variant o quizá se podría hacer que la clase product tenga métodos que devuelvan directamente los objetos variant
function variantFullFromPrimitives(
  primitives: PrimitiveVariantFull
): VariantFull {
  const sizes = primitives.sizes.map((size) => {
    return new VariantSize({
      sizeValue: new PositiveInteger(size.sizeValue),
      stock: new NonNegativeInteger(size.stock),
    });
  });

  const images = primitives.images.map((image) => {
    return new AppImage({
      imageAlt: image.imageAlt,
      imageUrl: new AppUrl(image.imageUrl),
    });
  });

  const details = primitives.details.map((detail) => {
    return new VariantDetail({
      title: detail.title,
      content: detail.content,
    });
  });

  const tags = primitives.tags.map((tag) => new VariantTag(tag));

  return new VariantFull({
    variantId: new UUID(primitives.variantId),
    hexColor: new HexColor(primitives.hexColor),
    createdAt: new Date(primitives.createdAt),
    updatedAt: new Date(primitives.updatedAt),
    tags,
    sizes,
    visibility: new Visibility(primitives.visibility),
    images,
    details,
  });
}

export class InMemoryProductRepository implements ProductRepository {
  private products: ProductFull[] = [];

  async create(params: { product: ProductFull }): Promise<void> {
    const { product } = params;
    this.products.push(product);
  }

  async find(params: { productId: UUID }): Promise<ProductFull | null> {
    const { productId } = params;
    return (
      this.products.find((product) => productId.equals(product.getId())) ?? null
    );
  }

  async list(params: {
    limit: PositiveInteger;
    offset: NonNegativeInteger;
    categories?: string[];
    productVisibility?: Visibility | Visibility[];
  }): Promise<ProductPreview[]> {
    const cloneProducts = this.products.map(ProductFull.clone);
    const { categories, limit, offset, productVisibility } = params;

    let productFilters = new Specification<ProductFull>(() => true);

    if (categories) {
      const categoryCriteria = new Specification(categoryFilter(categories));
      productFilters = productFilters.and(categoryCriteria);
    }

    if (productVisibility) {
      const visibilities = Array.isArray(productVisibility)
        ? productVisibility
        : [productVisibility];

      let visibilityCriteria = new Specification(
        productVisibilityFilter(visibilities[0])
      );

      visibilities.forEach((visibility, index) => {
        if (index === 0) return;
        const criteria = new Specification(productVisibilityFilter(visibility));
        visibilityCriteria = visibilityCriteria.or(criteria);
      });

      productFilters = productFilters.and(visibilityCriteria);
    }

    const filteredProducts = cloneProducts
      .filter(productFilters.isSatisfiedBy)
      .slice(offset.getValue(), offset.getValue() + limit.getValue());

    return filteredProducts.map(ProductPreview.from);
  }

  async countProducts(
    params: countProductsParams
  ): Promise<NonNegativeInteger> {
    const { categories, productVisibility } = params;

    let productFilters = new Specification<ProductFull>(() => true);

    if (categories) {
      const categoryCriteria = new Specification(categoryFilter(categories));
      productFilters = productFilters.and(categoryCriteria);
    }

    if (productVisibility) {
      const visibilities = Array.isArray(productVisibility)
        ? productVisibility
        : [productVisibility];

      let visibilityCriteria = new Specification(
        productVisibilityFilter(visibilities[0])
      );

      visibilities.forEach((visibility, index) => {
        if (index === 0) return;
        const criteria = new Specification(productVisibilityFilter(visibility));
        visibilityCriteria = visibilityCriteria.or(criteria);
      });

      productFilters = productFilters.and(visibilityCriteria);
    }

    const filteredProducts = this.products.filter(productFilters.isSatisfiedBy);

    return new NonNegativeInteger(filteredProducts.length);
  }

  async update(params: { product: ProductFull }): Promise<void> {
    const { product } = params;
    const index = this.products.findIndex((p) => p.getId() === product.getId());
    if (index === -1) throw new Error("Product not found");
    this.products[index] = product;
  }

  async checkCategoryUsage(params: { categoryName: string }): Promise<boolean> {
    const { categoryName } = params;
    return this.products.some((product) =>
      product.getCategories().includes(categoryName)
    );
  }

  async checkSizeUsage(params: {
    sizeValue: PositiveInteger;
  }): Promise<boolean> {
    const { sizeValue } = params;
    return this.products.some((product) =>
      product
        .toPrimitives()
        .variants.some((variant) =>
          variant.sizes.some((size) => sizeValue.equals(size.sizeValue))
        )
    );
  }

  async checkDetailUsage(params: { detailTitle: string }): Promise<boolean> {
    const { detailTitle } = params;
    return this.products.some((product) =>
      product
        .toPrimitives()
        .variants.some((variant) =>
          variant.details.some((detail) => detail.title === detailTitle)
        )
    );
  }

  async checkTagUsage(params: { tagName: string }): Promise<boolean> {
    const { tagName } = params;
    return this.products.some((product) =>
      product
        .toPrimitives()
        .variants.some((variant) => variant.tags.includes(tagName))
    );
  }

  async retrievePartialProductDetails(params: {
    productIds: UUID[];
  }): Promise<partialProductDetailsDto[]> {
    const { productIds } = params;
    const products = this.products.filter(productIdFilter(productIds));

    return products.map((product) => {
      const productPrimitives = product.toPrimitives();
      const variants = productPrimitives.variants.map((variant) => {
        const sizes = variant.sizes.map((size) => {
          return {
            sizeValue: size.sizeValue,
            stock: size.stock,
          };
        });

        return {
          variantId: variant.variantId,
          sizes,
        };
      });

      return {
        productId: productPrimitives.productId,
        unitPrice: productPrimitives.price.baseValue,
        variants,
      };
    });
  }

  async updatePartialProduct(params: {
    productId: UUID;
    productName: string;
    productDescription: string;
    productCategories: string[];
    productPrice: ProductPrice;
    productVisibility: Visibility;
  }): Promise<void> {
    const {
      productId,
      productName,
      productDescription,
      productCategories,
      productPrice,
      productVisibility,
    } = params;

    const productIndex = this.products.findIndex((p) =>
      productId.equals(p.getId())
    );

    if (productIndex === -1) throw new ProductNotFoundError({ productId });

    const product = this.products[productIndex];

    const productPrimitives = product.toPrimitives();

    const newProduct = new ProductFull({
      productId: new UUID(product.getId()),
      name: productName,
      description: productDescription,
      categories: productCategories,
      price: productPrice,
      variants: productPrimitives.variants.map(variantFullFromPrimitives),
      visibility: Visibility.clone(productVisibility),
    });

    this.products[productIndex] = newProduct;
  }

  async modifyStock(
    stockUpdateItems: {
      productId: UUID;
      variantId: UUID;
      size: { sizeValue: PositiveInteger; stockAdjustment: Integer };
    }[]
  ): Promise<void> {
    const productClones = this.products.map(ProductFull.clone);

    stockUpdateItems.forEach((item) => {
      const productIndex = productClones.findIndex((p) =>
        item.productId.equals(p.getId())
      );
      if (productIndex === -1) {
        throw new ProductNotFoundError({ productId: item.productId });
      }

      const product = productClones[productIndex];

      const variant = product
        .toPrimitives()
        .variants.find((v) => item.variantId.equals(v.variantId));

      if (!variant) {
        throw new VariantNotFoundError({ variantId: item.variantId });
      }

      const HasSize = variant.sizes.some((size) =>
        item.size.sizeValue.equals(size.sizeValue)
      );

      if (!HasSize) throw new Error("Variant size not found");

      const productPrimitives = product.toPrimitives();

      const newVariants = productPrimitives.variants.map((v) => {
        const isSameVariant = item.variantId.equals(v.variantId);
        if (!isSameVariant) return v;

        const newSizes = v.sizes.map((size) => {
          const isSizeEqual = item.size.sizeValue.equals(size.sizeValue);
          if (!isSizeEqual) return size;

          return {
            sizeValue: size.sizeValue,
            stock: size.stock + item.size.stockAdjustment.getValue(),
          };
        });

        return {
          ...v,
          sizes: newSizes,
        };
      });

      const updatedProduct = new ProductFull({
        productId: new UUID(product.getId()),
        name: product.getName(),
        description: product.getDescription(),
        categories: product.getCategories(),
        price: new ProductPrice({
          baseValue: new PositiveInteger(productPrimitives.price.baseValue),
          discountType: new DiscountType(productPrimitives.price.discountType),
          discountValue: new NonNegativeInteger(
            productPrimitives.price.discountValue
          ),
          discountStartAt: productPrimitives.price.discountStartAt,
          discountEndAt: productPrimitives.price.discountEndAt,
        }),
        variants: newVariants.map(variantFullFromPrimitives),
        visibility: new Visibility(productPrimitives.visibility),
      });

      productClones[productIndex] = updatedProduct;
    });

    this.products = productClones;
  }

  async addVariantToProduct(params: {
    productId: UUID;
    variant: VariantFull;
  }): Promise<void> {
    const { productId, variant } = params;

    const productIndex = this.products.findIndex((p) =>
      productId.equals(p.getId())
    );

    if (productIndex === -1) throw new ProductNotFoundError({ productId });

    const product = this.products[productIndex];

    const productPrimitives = product.toPrimitives();

    const variants = productPrimitives.variants.map(variantFullFromPrimitives);
    variants.push(variant);

    const newProduct = new ProductFull({
      productId: new UUID(product.getId()),
      name: product.getName(),
      description: product.getDescription(),
      categories: product.getCategories(),
      price: new ProductPrice({
        baseValue: new PositiveInteger(productPrimitives.price.baseValue),
        discountType: new DiscountType(productPrimitives.price.discountType),
        discountValue: new NonNegativeInteger(
          productPrimitives.price.discountValue
        ),
        discountStartAt: productPrimitives.price.discountStartAt,
        discountEndAt: productPrimitives.price.discountEndAt,
      }),
      variants,
      visibility: new Visibility(productPrimitives.visibility),
    });

    this.products[productIndex] = newProduct;
  }

  async updateVariant(params: {
    productId: UUID;
    variant: VariantFull;
  }): Promise<void> {
    const { productId, variant } = params;

    const productIndex = this.products.findIndex((p) =>
      productId.equals(p.getId())
    );

    if (productIndex === -1) throw new ProductNotFoundError({ productId });

    const product = this.products[productIndex];

    const productPrimitives = product.toPrimitives();

    const variants = productPrimitives.variants.map(variantFullFromPrimitives);
    const variantIndex = variants.findIndex(
      (v) => variant.getId() === v.getId()
    );
    if (variantIndex === -1)
      throw new VariantNotFoundError({ variantId: variant.getId() });

    variants[variantIndex] = variant;

    const newProduct = new ProductFull({
      productId: new UUID(product.getId()),
      name: product.getName(),
      description: product.getDescription(),
      categories: product.getCategories(),
      visibility: new Visibility(productPrimitives.visibility),
      price: new ProductPrice({
        baseValue: new PositiveInteger(productPrimitives.price.baseValue),
        discountType: new DiscountType(productPrimitives.price.discountType),
        discountValue: new NonNegativeInteger(
          productPrimitives.price.discountValue
        ),
        discountStartAt: productPrimitives.price.discountStartAt,
        discountEndAt: productPrimitives.price.discountEndAt,
      }),
      variants,
    });

    this.products[productIndex] = newProduct;
  }

  async deleteProduct(params: { productId: UUID }): Promise<void> {
    const { productId } = params;
    this.products = this.products.filter((product) => {
      return !productId.equals(product.getId());
    });
  }

  async deleteVariant(params: {
    productId: UUID;
    variantId: UUID;
  }): Promise<void> {
    const { productId, variantId } = params;

    const productIndex = this.products.findIndex((p) =>
      productId.equals(p.getId())
    );

    if (productIndex === -1) throw new ProductNotFoundError({ productId });

    const product = this.products[productIndex];

    const productPrimitives = product.toPrimitives();

    const variants = productPrimitives.variants.map(variantFullFromPrimitives);
    const variantIndex = variants.findIndex((v) => variantId.equals(v.getId()));
    if (variantIndex === -1) throw new VariantNotFoundError({ variantId });

    variants.splice(variantIndex, 1);

    const newProduct = new ProductFull({
      productId: new UUID(product.getId()),
      name: product.getName(),
      description: product.getDescription(),
      categories: product.getCategories(),
      price: new ProductPrice({
        baseValue: new PositiveInteger(productPrimitives.price.baseValue),
        discountType: new DiscountType(productPrimitives.price.discountType),
        discountValue: new NonNegativeInteger(
          productPrimitives.price.discountValue
        ),
        discountStartAt: productPrimitives.price.discountStartAt,
        discountEndAt: productPrimitives.price.discountEndAt,
      }),
      variants,
      visibility: new Visibility(productPrimitives.visibility),
    });

    this.products[productIndex] = newProduct;
  }
}
