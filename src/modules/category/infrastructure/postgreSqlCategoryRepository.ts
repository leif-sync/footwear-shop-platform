import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { prismaConnection } from "../../shared/infrastructure/prismaClient.js";
import { Category } from "../domain/category.js";
import { CategoryName } from "../domain/categoryName.js";
import { CategoryRepository } from "../domain/categoryRepository.js";

export class PostgresCategoryRepostory implements CategoryRepository {
  async create(params: { category: Category }): Promise<void> {
    const { categoryId, categoryName } = params.category.toPrimitives();

    await prismaConnection.category.create({
      data: {
        categoryId,
        name: categoryName,
      },
    });
  }

  async find(params: { categoryName: CategoryName }): Promise<Category | null>;
  async find(params: { categoryId: UUID }): Promise<Category | null>;
  async find(
    params: { categoryName: CategoryName } | { categoryId: UUID }
  ): Promise<Category | null> {
    const isCategoryId = "categoryId" in params;

    if (isCategoryId) {
      const categoryId = params.categoryId.getValue();

      const storedCategory = await prismaConnection.category.findUnique({
        where: {
          categoryId,
        },
      });

      if (!storedCategory) return null;

      return new Category({
        categoryId: new UUID(storedCategory.categoryId),
        categoryName: new CategoryName(storedCategory.name),
      });
    }

    const name = params.categoryName.getValue();

    const storedCategory = await prismaConnection.category.findUnique({
      where: {
        name,
      },
    });

    if (!storedCategory) return null;

    return new Category({
      categoryId: new UUID(storedCategory.categoryId),
      categoryName: new CategoryName(storedCategory.name),
    });
  }

  async countCategories(): Promise<NonNegativeInteger> {
    const categoriesCount = await prismaConnection.category.count();
    return new NonNegativeInteger(categoriesCount);
  }

  async list(params: {
    limit: PositiveInteger;
    offset: NonNegativeInteger;
  }): Promise<Category[]> {
    const limit = params.limit.getValue();
    const offset = params.offset.getValue();

    const storedCategories = await prismaConnection.category.findMany({
      skip: offset,
      take: limit,
    });

    return storedCategories.map(
      (storedCategory) =>
        new Category({
          categoryId: new UUID(storedCategory.categoryId),
          categoryName: new CategoryName(storedCategory.name),
        })
    );
  }

  async delete(params: { categoryId: UUID }): Promise<void>;
  async delete(params: { categoryName: CategoryName }): Promise<void>;
  async delete(
    params: { categoryId: UUID } | { categoryName: CategoryName }
  ): Promise<void> {
    const isCategoryId = "categoryId" in params;

    if (isCategoryId) {
      const categoryId = params.categoryId.getValue();
      await prismaConnection.category.delete({
        where: {
          categoryId,
        },
      });
      return;
    }

    const name = params.categoryName.getValue();
    await prismaConnection.category.delete({
      where: {
        name,
      },
    });
  }

  async retrieveCategoriesByName(
    categoryName: CategoryName | CategoryName[]
  ): Promise<Category[]> {
    const categoryNames = Array.isArray(categoryName)
      ? categoryName.map((categoryName) => categoryName.getValue())
      : [categoryName.getValue()];

    const or_categories = categoryNames.map((categoryName) => ({
      name: categoryName,
    }));

    const storedCategories = await prismaConnection.category.findMany({
      where: {
        OR: or_categories,
      },
    });

    return storedCategories.map(
      (storedCategory) =>
        new Category({
          categoryId: new UUID(storedCategory.categoryId),
          categoryName: new CategoryName(storedCategory.name),
        })
    );
  }
}
