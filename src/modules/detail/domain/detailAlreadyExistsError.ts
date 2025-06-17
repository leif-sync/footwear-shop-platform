import { DetailTitle } from "./detailTitle.js";

export class DetailAlreadyExistsError extends Error {
  constructor(params: { detailTitle: string | DetailTitle }) {
    const title =
      params.detailTitle instanceof DetailTitle
        ? params.detailTitle.getValue()
        : params.detailTitle;

    super(`Detail with title ${title} already exists`);
  }
}
