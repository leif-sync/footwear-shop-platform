import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { ProductAssociatedDataProvider } from "./productAssociatedDataProvider.js";
import { InvalidCategoryError } from "./errors/invalidCategoryError.js";
import { InvalidDetailError } from "./errors/invalidDetailError.js";
import { InvalidSizeError } from "./errors/invalidSizeError.js";
import { InvalidTagError } from "./errors/invalidTagError.js";

export class ProductValidationService {
  private readonly productAssociatedDataProvider: ProductAssociatedDataProvider;

  constructor(params: {
    productAssociatedDataProvider: ProductAssociatedDataProvider;
  }) {
    this.productAssociatedDataProvider = params.productAssociatedDataProvider;
  }

  async ensureProductCategoryValidity(
    categoryName: string | string[]
  ): Promise<void> {
    const categories = Array.isArray(categoryName)
      ? categoryName
      : [categoryName];

    const validCategories =
      await this.productAssociatedDataProvider.retrieveCategoriesByName(
        categories
      );

    const validCategoriesSet = new Set(validCategories);

    categories.forEach((categoryName) => {
      const isValidCategoryName = validCategoriesSet.has(categoryName);
      if (!isValidCategoryName) {
        throw new InvalidCategoryError({ categoryName });
      }
    });
  }

  async ensureVariantTagValidity(tagName: string | string[]): Promise<void> {
    const tags = Array.isArray(tagName) ? tagName : [tagName];

    const validTags =
      await this.productAssociatedDataProvider.retrieveTagsByName(tags);

    const validTagsSet = new Set(validTags);

    tags.forEach((tagName) => {
      const isValidTagName = validTagsSet.has(tagName);
      if (!isValidTagName) throw new InvalidTagError({ tagName });
    });
  }

  async ensureVariantSizeValidity(
    sizeValue: PositiveInteger | PositiveInteger[]
  ): Promise<void> {
    const sizes = Array.isArray(sizeValue) ? sizeValue : [sizeValue];

    const validSizes =
      await this.productAssociatedDataProvider.retrieveSizesByValue(sizes);

    const validSizesSet = new Set(validSizes);

    sizes.forEach((size) => {
      const sizeValue = size.getValue();
      const isValidSizeValue = validSizesSet.has(sizeValue);
      if (!isValidSizeValue) throw new InvalidSizeError({ sizeValue });
    });
  }

  async ensureVariantDetailsValidity(
    detailName: string | string[]
  ): Promise<void> {
    const details = Array.isArray(detailName) ? detailName : [detailName];

    const validDetails =
      await this.productAssociatedDataProvider.retrieveDetailsByTitle(details);

    const validDetailsSet = new Set(validDetails);

    details.forEach((detailName) => {
      const isValidDetailName = validDetailsSet.has(detailName);
      if (!isValidDetailName) throw new InvalidDetailError({ detailName });
    });
  }
}
