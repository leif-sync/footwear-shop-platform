import { SizeRepository } from "../domain/sizeRepository.js";

export class CountSizes {
  private readonly sizeRepository: SizeRepository;

  constructor(params: { sizeRepository: SizeRepository }) {
    this.sizeRepository = params.sizeRepository;
  }

  async run() {
    const count = await this.sizeRepository.countSizes();
    return count.getValue();
  }
}
