export abstract class AssociatedDataProvider {
  abstract checkCategoryUsage(params: {
    categoryName: string;
  }): Promise<boolean>;
}
