export class DuplicatedCategoryError extends Error {
  constructor(params: { categoryName: string }) {
    super(`Duplicated category: ${params.categoryName}`);
  }
}
