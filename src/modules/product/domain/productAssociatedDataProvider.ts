import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";

export abstract class ProductAssociatedDataProvider {
  abstract retrieveCategoriesByName(
    categoryName: string | string[]
  ): Promise<string[]>;
  abstract retrieveTagsByName(tagName: string | string[]): Promise<string[]>;
  abstract retrieveSizesByValue(
    sizeValue: PositiveInteger | PositiveInteger[]
  ): Promise<number[]>;
  abstract retrieveDetailsByTitle(
    detailTitle: string | string[]
  ): Promise<string[]>;
  abstract checkIfProductPurchased(params: {
    productId: UUID;
  }): Promise<boolean>;
  abstract checkIfVariantPurchased(params: {
    productId: UUID;
    variantId: UUID;
  }): Promise<boolean>;
}
