import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Category } from "../domain/category.js";
import { CategoryName } from "../domain/categoryName.js";
import { CategoryRepository } from "../domain/categoryRepository.js";

export class InMemoryCategoryRepository implements CategoryRepository {
  private categories: Category[] = [];

  async create(params: { category: Category }): Promise<void> {
    this.categories.push(params.category);
  }

  async countCategories(): Promise<NonNegativeInteger> {
    const count = this.categories.length;
    return new NonNegativeInteger(count);
  }

  async list(params: {
    limit: PositiveInteger;
    offset: NonNegativeInteger;
  }): Promise<Category[]> {
    const limit = params.limit.getValue();
    const offset = params.offset.getValue();
    const categories = this.categories.slice(offset, offset + limit);
    return categories.map((category) => Category.clone(category));
  }

  private findByName(name: CategoryName): Category | null {
    const category = this.categories.find((category) =>
      name.equals(category.getName())
    );
    if (!category) return null;
    return Category.clone(category);
  }

  private findById(id: UUID): Category | null {
    const category = this.categories.find((category) =>
      id.equals(category.getId())
    );
    if (!category) return null;
    return Category.clone(category);
  }

  async find(params: { categoryName: CategoryName }): Promise<Category | null>;
  async find(params: { categoryId: UUID }): Promise<Category | null>;
  async find(
    params:
      | {
          categoryName: CategoryName;
        }
      | {
          categoryId: UUID;
        }
  ): Promise<Category | null> {
    const isCategoryId = "categoryId" in params;
    if (isCategoryId) {
      return this.findById(params.categoryId);
    }
    return this.findByName(params.categoryName);
  }

  private async deleteByName(name: CategoryName): Promise<void> {
    this.categories = this.categories.filter((category) =>
      name.equals(category.getName())
    );
  }

  async retrieveCategoriesByName(
    categoryName: CategoryName | CategoryName[]
  ): Promise<Category[]> {
    const categoriesToSearch = Array.isArray(categoryName)
      ? categoryName.map((name) => name.getValue())
      : [categoryName.getValue()];

    return this.categories.filter((category) =>
      categoriesToSearch.includes(category.getName().getValue())
    );
  }

  private async deleteById(id: UUID): Promise<void> {
    this.categories = this.categories.filter(
      (category) => !id.equals(category.getId())
    );
  }

  async delete(params: { categoryId: UUID }): Promise<void>;
  async delete(params: { categoryName: CategoryName }): Promise<void>;
  async delete(
    params:
      | {
          categoryName: CategoryName;
        }
      | { categoryId: UUID }
  ): Promise<void> {
    const isCategoryId = "categoryId" in params;
    if (isCategoryId) {
      return this.deleteById(params.categoryId);
    }
    return this.deleteByName(params.categoryName);
  }
}
