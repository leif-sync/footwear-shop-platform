import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Detail } from "../domain/detail.js";
import { DetailRepository } from "../domain/detailRepository.js";

type findParams = { detailId?: UUID; detailName?: string };
type deleteParams = { detailId?: UUID; detailName?: string };

export class InMemoryDetailRepository implements DetailRepository {
  private details: Detail[] = [];

  async create(params: { detail: Detail }): Promise<void> {
    this.details.push(params.detail);
  }

  private async findById(id: UUID): Promise<Detail | null> {
    const detail = this.details.find((detail) => id.equals(detail.getId()));
    if (!detail) return null;
    return Detail.clone(detail);
  }

  private async findByName(detailName: string): Promise<Detail | null> {
    const detail = this.details.find(
      (detail) => detailName === detail.getTitle()
    );
    if (!detail) return null;
    return Detail.clone(detail);
  }

  async find(params: { detailId: UUID }): Promise<Detail | null>;
  async find(params: { detailName: string }): Promise<Detail | null>;
  async find(params: findParams): Promise<Detail | null> {
    const { detailId, detailName } = params;
    if (detailId) return this.findById(detailId);
    if (detailName) return this.findByName(detailName);
    throw new Error("Invalid params");
  }

  async countDetails(): Promise<NonNegativeInteger> {
    const count = this.details.length;
    return new NonNegativeInteger(count);
  }

  async list(params: {
    limit: PositiveInteger;
    offset: NonNegativeInteger;
  }): Promise<Detail[]> {
    const limit = params.limit.getValue();
    const offset = params.offset.getValue();
    const details = this.details.slice(offset, offset + limit);
    return details.map((detail) => Detail.clone(detail));
  }

  private async deleteById(id: UUID): Promise<void> {
    this.details = this.details.filter((detail) => !id.equals(detail.getId()));
  }

  private async deleteByName(detailName: string): Promise<void> {
    this.details = this.details.filter(
      (detail) => detailName !== detail.getTitle()
    );
  }

  async delete(params: { detailId: UUID }): Promise<void>;
  async delete(params: { detailName: string }): Promise<void>;
  async delete(params: deleteParams): Promise<void> {
    const { detailId, detailName } = params;
    if (detailId) return this.deleteById(detailId);
    if (detailName) return this.deleteByName(detailName);
    throw new Error("Invalid params");
  }

  async retrieveDetailsByName(
    detailName: string | string[]
  ): Promise<Detail[]> {
    const detailNames = Array.isArray(detailName) ? detailName : [detailName];
    return this.details.filter((detail) =>
      detailNames.includes(detail.getTitle())
    );
  }

  async update(params: { detail: Detail }): Promise<void> {
    const { detail } = params;
    const index = this.details.findIndex(
      (detail) => detail.getId() === detail.getId()
    );
    if (index === -1) throw new Error("Detail not found");
    this.details[index] = detail;
  }
}
