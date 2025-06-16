
/**
 * Provides methods to check the usage of categories in the system.
 */
export abstract class AssociatedDataProvider {
  abstract checkCategoryUsage(params: {
    categoryName: string;
  }): Promise<boolean>;
}
