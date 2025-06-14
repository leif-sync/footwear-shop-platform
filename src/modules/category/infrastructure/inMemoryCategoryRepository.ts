import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Category } from "../domain/category.js";
import { CategoryRepository } from "../domain/categoryRepository.js";

type findParams = { categoryName?: string; categoryId?: UUID };
type deleteParams = { categoryName?: string; categoryId?: UUID };

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
  private findByName(name: string): Category | null {
    const category = this.categories.find(
      (category) => category.getName() === name
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

  async find(params: { categoryName: string }): Promise<Category | null>;
  async find(params: { categoryId: UUID }): Promise<Category | null>;
  async find(params: findParams): Promise<Category | null> {
    const { categoryName, categoryId } = params;
    if (categoryName) return this.findByName(categoryName);
    if (categoryId) return this.findById(categoryId);
    throw new Error("Invalid params");
  }

  private async deleteByName(name: string): Promise<void> {
    this.categories = this.categories.filter(
      (category) => category.getName() !== name
    );
  }

  async retrieveCategoriesByName(
    categoryName: string | string[]
  ): Promise<Category[]> {
    const categoryNames = Array.isArray(categoryName)
      ? categoryName
      : [categoryName];
    return this.categories.filter((category) =>
      categoryNames.includes(category.getName())
    );
  }

  private async deleteById(id: UUID): Promise<void> {
    this.categories = this.categories.filter(
      (category) => !id.equals(category.getId())
    );
  }

  async delete(params: { categoryId: UUID }): Promise<void>;
  async delete(params: { categoryName: string }): Promise<void>;
  async delete(params: deleteParams): Promise<void> {
    const { categoryName, categoryId } = params;
    if (categoryName) return this.deleteByName(categoryName);
    if (categoryId) return this.deleteById(categoryId);
    throw new Error("Invalid params");
  }
}
