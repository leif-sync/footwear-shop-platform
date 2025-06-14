import { UUID } from "../../shared/domain/UUID.js";

export class DetailNotFoundError extends Error {
  constructor(params: { detailId: string | UUID });
  constructor(params: { detailName: string });
  constructor(params: { detailName?: string; detailId?: string | UUID }) {
    const { detailName } = params;
    const detailId =
      params.detailId instanceof UUID
        ? params.detailId.getValue()
        : params.detailId;
        
    if (detailId) super(`Detail with id ${detailId} not found`);
    else if (detailName) super(`Detail with name ${detailName} not found`);
    else throw new Error("Invalid params");
  }
}
