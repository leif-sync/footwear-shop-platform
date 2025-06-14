import { CategoryRepository } from "../domain/categoryRepository.js";

export class CountCategories {
  private readonly categoryRepository: CategoryRepository;

  constructor(params: { categoryRepository: CategoryRepository }) {
    this.categoryRepository = params.categoryRepository;
  }

  async run() {
    const count = await this.categoryRepository.countCategories();
    return count.getValue();
  }
}
