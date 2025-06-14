export abstract class CategoryValidationService {
  abstract checkCategoryUsage(params: {
    categoryName: string;
  }): Promise<boolean>;
}
