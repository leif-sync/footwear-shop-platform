import { UUID } from "../../shared/domain/UUID.js";
import { AdminRefreshToken } from "../domain/adminRefreshToken.js";
import { AdminRefreshTokenRepository } from "../domain/adminRefreshTokenRepository.js";

export class InMemoryRefreshTokenRepository
  implements AdminRefreshTokenRepository
{
  private readonly tokens: Map<string, AdminRefreshToken> = new Map();

  async create(params: { refreshToken: AdminRefreshToken }): Promise<void> {
    const { refreshToken } = params;
    this.tokens.set(refreshToken.getId(), refreshToken);
  }

  async find(params: { tokenId: UUID }): Promise<AdminRefreshToken | null> {
    const { tokenId } = params;
    const token = this.tokens.get(tokenId.getValue());
    return token ? AdminRefreshToken.clone(token) : null;
  }

  async delete(params: { tokenId: UUID }): Promise<void> {
    const { tokenId } = params;
    this.tokens.delete(tokenId.getValue());
  }
}
