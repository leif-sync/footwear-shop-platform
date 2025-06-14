import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
// import { ProductSalesData } from "./productSalesData.js";
import { ProductFull } from "./productFull.js";
import { ProductPreview } from "./productPreview.js";
import { partialProductDetailsDto } from "./dto/partialProductDetails.js";
import { ProductPrice } from "./productPrice.js";
import { VariantFull } from "./variantFull.js";
import { Integer } from "../../shared/domain/integer.js";
import { Visibility } from "./visibility.js";
import { SmartOmit } from "../../shared/domain/helperTypes.js";

export type listProductsParams = {
  limit: PositiveInteger;
  offset: NonNegativeInteger;
  categories?: string[];
  productVisibility?: Visibility | Visibility[];
};

export type countProductsParams = SmartOmit<
  listProductsParams,
  "limit" | "offset"
>;

export abstract class ProductRepository {
  // TODO:
  abstract list(params: listProductsParams): Promise<ProductPreview[]>;

  abstract countProducts(
    params: countProductsParams
  ): Promise<NonNegativeInteger>;

  abstract create(params: { product: ProductFull }): Promise<void>;

  abstract find(params: { productId: UUID }): Promise<ProductFull | null>;

  abstract updatePartialProduct(params: {
    productId: UUID;
    productName: string;
    productDescription: string;
    productCategories: string[];
    productPrice: ProductPrice;
    productVisibility: Visibility;
  }): Promise<void>;

  abstract addVariantToProduct(params: {
    productId: UUID;
    variant: VariantFull;
  }): Promise<void>;

  abstract updateVariant(params: {
    productId: UUID;
    variant: VariantFull;
  }): Promise<void>;

  abstract checkSizeUsage(params: {
    sizeValue: PositiveInteger;
  }): Promise<boolean>;

  abstract checkDetailUsage(params: { detailName: string }): Promise<boolean>;

  abstract checkCategoryUsage(params: {
    categoryName: string;
  }): Promise<boolean>;

  abstract checkTagUsage(params: { tagName: string }): Promise<boolean>;

  abstract retrievePartialProductDetails(params: {
    productIds: UUID[];
  }): Promise<partialProductDetailsDto[]>;

  abstract modifyStock(
    products: {
      productId: UUID;
      variantId: UUID;
      size: { sizeValue: PositiveInteger; stockAdjustment: Integer };
    }[]
  ): Promise<void>;

  abstract deleteProduct(params: { productId: UUID }): Promise<void>;
  abstract deleteVariant(params: {
    productId: UUID;
    variantId: UUID;
  }): Promise<void>;
}
