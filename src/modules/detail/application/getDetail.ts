import { UUID } from "../../shared/domain/UUID.js";
import { DetailNotFoundError } from "../domain/detailNotFoundError.js";
import { DetailRepository } from "../domain/detailRepository.js";

export class GetDetail {
  private readonly detailRepository: DetailRepository;

  constructor(params: { detailRepository: DetailRepository }) {
    this.detailRepository = params.detailRepository;
  }

  private async getDetailById(id: string) {
    const detailId = new UUID(id);
    const detail = await this.detailRepository.find({ detailId });
    if (!detail) throw new DetailNotFoundError({ detailId });
    return detail.toPrimitives();
  }

  private async getDetailByName(detailName: string) {
    const detail = await this.detailRepository.find({ detailName });
    if (!detail) throw new DetailNotFoundError({ detailName });
    return detail.toPrimitives();
  }

  async run(params: { detailId: string }): Promise<{
    detailId: string;
    detailName: string;
  }>;
  async run(params: { detailName: string }): Promise<{
    detailId: string;
    detailName: string;
  }>;

  async run(params: { detailId?: string; detailName?: string }) {
    const { detailId, detailName } = params;
    if (detailId) return this.getDetailById(detailId);
    if (detailName) return this.getDetailByName(detailName);
    throw new Error("Invalid params");
  }
}
