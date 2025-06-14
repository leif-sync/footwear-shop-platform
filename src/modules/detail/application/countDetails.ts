import { DetailRepository } from "../domain/detailRepository.js";

export class CountDetails {
  private readonly detailRepository: DetailRepository;

  constructor(params: { detailRepository: DetailRepository }) {
    this.detailRepository = params.detailRepository;
  }

  async run() {
    const count = await this.detailRepository.countDetails();
    return count.getValue();
  }
}