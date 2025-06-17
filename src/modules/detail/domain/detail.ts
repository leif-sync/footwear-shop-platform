import { UUID } from "../../shared/domain/UUID.js";
import { DetailTitle } from "./detailTitle.js";

export interface PrimitiveDetail {
  detailId: string;
  detailTitle: string;
}

export class Detail {
  private readonly detailId: UUID;
  private readonly detailTitle: DetailTitle;

  constructor(params: { detailId: UUID; detailTitle: DetailTitle }) {
    this.detailId = params.detailId;
    this.detailTitle = params.detailTitle;
  }

  static clone(detail: Detail): Detail {
    return new Detail({
      detailId: detail.detailId,
      detailTitle: detail.detailTitle,
    });
  }

  getId(): UUID {
    return this.detailId;
  }

  getTitle(): DetailTitle {
    return this.detailTitle;
  }

  toPrimitives(): PrimitiveDetail {
    return {
      detailId: this.detailId.getValue(),
      detailTitle: this.detailTitle.getValue(),
    };
  }
}
