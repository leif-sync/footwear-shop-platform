import { UUID } from "../../shared/domain/UUID.js";
import { AdminRefreshToken } from "./adminRefreshToken.js";

export abstract class AdminRefreshTokenRepository {
  abstract create(params: { refreshToken: AdminRefreshToken }): Promise<void>;
  abstract find(params: { tokenId: UUID }): Promise<AdminRefreshToken | null>;
  abstract delete(params: { tokenId: UUID }): Promise<void>;
}
