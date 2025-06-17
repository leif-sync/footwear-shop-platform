import { UUID } from "../../shared/domain/UUID.js";
import { DetailNotFoundError } from "../domain/detailNotFoundError.js";
import { DetailRepository } from "../domain/detailRepository.js";
import { DetailTitle } from "../domain/detailTitle.js";

export class GetDetail {
  private readonly detailRepository: DetailRepository;

  constructor(params: { detailRepository: DetailRepository }) {
    this.detailRepository = params.detailRepository;
  }

  private async getDetailById(detailId: UUID) {
    const detail = await this.detailRepository.find({ detailId });
    if (!detail) throw new DetailNotFoundError({ detailId });
    return detail.toPrimitives();
  }

  private async getDetailByTitle(detailTitle: DetailTitle) {
    const detail = await this.detailRepository.find({ detailTitle });
    if (!detail) throw new DetailNotFoundError({ detailTitle });
    return detail.toPrimitives();
  }

  async run(params: { detailId: UUID }): Promise<{
    detailId: string;
    detailTitle: string;
  }>;

  async run(params: { detailTitle: DetailTitle }): Promise<{
    detailId: string;
    detailTitle: string;
  }>;

  async run(params: { detailId: UUID } | { detailTitle: DetailTitle }) {
    const isDetailId = "detailId" in params;
    if (isDetailId) return this.getDetailById(params.detailId);
    return this.getDetailByTitle(params.detailTitle);
  }
}
