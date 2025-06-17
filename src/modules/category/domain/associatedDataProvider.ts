import { CategoryName } from "./categoryName.js";

/**
 * Provides methods to check the usage of categories in the system.
 */
export abstract class AssociatedDataProvider {
  abstract checkCategoryUsage(params: {
    categoryName: CategoryName;
  }): Promise<boolean>;
}
