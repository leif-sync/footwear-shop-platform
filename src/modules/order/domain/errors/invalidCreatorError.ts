import { UUID } from "../../../shared/domain/UUID.js";

export class InvalidCreatorError extends Error {
  constructor(params: { creatorId: UUID | string }) {
    const { creatorId } = params;
    const id = creatorId instanceof UUID ? creatorId.getValue() : creatorId;
    super(`Invalid creator ID: ${id}`);
  }
}
