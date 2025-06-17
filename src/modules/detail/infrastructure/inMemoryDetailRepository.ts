import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Detail } from "../domain/detail.js";
import { DetailNotFoundError } from "../domain/detailNotFoundError.js";
import { DetailRepository } from "../domain/detailRepository.js";
import { DetailTitle } from "../domain/detailTitle.js";

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

  private async findByTitle(detailTitle: DetailTitle): Promise<Detail | null> {
    const detail = this.details.find((detail) =>
      detailTitle.equals(detail.getTitle())
    );
    if (!detail) return null;
    return Detail.clone(detail);
  }

  async find(params: { detailId: UUID }): Promise<Detail | null>;
  async find(params: { detailTitle: DetailTitle }): Promise<Detail | null>;
  async find(
    params:
      | {
          detailId: UUID;
        }
      | {
          detailTitle: DetailTitle;
        }
  ): Promise<Detail | null> {
    const isDetailId = "detailId" in params;
    if (isDetailId) {
      const id = params.detailId;
      return this.findById(id);
    }
    return this.findByTitle(params.detailTitle);
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

  private async deleteByTitle(detailTitle: DetailTitle): Promise<void> {
    this.details = this.details.filter((detail) =>
      detailTitle.equals(detail.getTitle())
    );
  }

  async delete(params: { detailId: UUID }): Promise<void>;
  async delete(params: { detailTitle: DetailTitle }): Promise<void>;
  async delete(
    params:
      | {
          detailId: UUID;
        }
      | {
          detailTitle: DetailTitle;
        }
  ): Promise<void> {
    const isDetailId = "detailId" in params;
    if (isDetailId) {
      const id = params.detailId;
      return this.deleteById(id);
    }
    return this.deleteByTitle(params.detailTitle);
  }

  async retrieveDetailsByTitle(
    detailTitle: DetailTitle | DetailTitle[]
  ): Promise<Detail[]> {
    const detailTitles = Array.isArray(detailTitle)
      ? detailTitle.map((detailTitle) => detailTitle.getValue())
      : [detailTitle.getValue()];
    return this.details.filter((detail) =>
      detailTitles.includes(detail.getTitle().getValue())
    );
  }

  async update(params: { detail: Detail }): Promise<void> {
    const { detail } = params;
    const index = this.details.findIndex(
      (detail) => detail.getId() === detail.getId()
    );
    if (index === -1) {
      throw new DetailNotFoundError({
        detailId: detail.getId(),
      });
    }
    this.details[index] = detail;
  }
}
