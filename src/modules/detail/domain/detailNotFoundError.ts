import { UUID } from "../../shared/domain/UUID.js";
import { DetailTitle } from "./detailTitle.js";

export class DetailNotFoundError extends Error {
  constructor(params: { detailId: string | UUID });
  constructor(params: { detailTitle: string | DetailTitle });
  constructor(
    params: { detailTitle: string | DetailTitle } | { detailId: string | UUID }
  ) {
    const isDetailId = "detailId" in params;

    if (isDetailId) {
      const id =
        params.detailId instanceof UUID
          ? params.detailId.getValue()
          : params.detailId;

      super(`Detail with id ${id} not found`);
      return;
    }

    const title =
      params.detailTitle instanceof DetailTitle
        ? params.detailTitle.getValue()
        : params.detailTitle;
    super(`Detail with title ${title} not found`);
    this.name = "DetailNotFoundError";
  }
}
