import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { Detail } from "./detail.js";
import { DetailTitle } from "./detailTitle.js";

export abstract class DetailRepository {
  abstract create(params: { detail: Detail }): Promise<void>;

  abstract find(params: { detailId: UUID }): Promise<Detail | null>;
  abstract find(params: { detailTitle: DetailTitle }): Promise<Detail | null>;

  abstract list(params: {
    limit: PositiveInteger;
    offset: NonNegativeInteger;
  }): Promise<Detail[]>;

  abstract countDetails(): Promise<NonNegativeInteger>;

  abstract retrieveDetailsByTitle(
    detailTitle: DetailTitle | DetailTitle[]
  ): Promise<Detail[]>;

  abstract delete(params: { detailId: UUID }): Promise<void>;
  abstract delete(params: { detailTitle: DetailTitle }): Promise<void>;

  abstract update(params: { detail: Detail }): Promise<void>;
}
