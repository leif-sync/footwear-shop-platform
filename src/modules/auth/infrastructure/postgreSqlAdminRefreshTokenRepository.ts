import { AdminRefreshTokenRepository } from "../domain/adminRefreshTokenRepository.js";
import { prismaConnection } from "../../shared/infrastructure/prismaClient.js";
import { AdminRefreshToken } from "../domain/adminRefreshToken.js";
import { UUID } from "../../shared/domain/UUID.js";

export class PostgresAdminRefreshTokenRepository
  implements AdminRefreshTokenRepository
{
  async create(params: { refreshToken: AdminRefreshToken }): Promise<void> {
    const { adminId, tokenId } = params.refreshToken.toPrimitives();

    await prismaConnection.adminRefreshToken.create({
      data: {
        adminId,
        tokenId,
      },
    });
  }

  async find(params: { tokenId: UUID }): Promise<AdminRefreshToken | null> {
    const tokenId = params.tokenId.getValue();

    const storedRefreshToken =
      await prismaConnection.adminRefreshToken.findFirst({
        where: {
          tokenId,
        },
      });

    if (!storedRefreshToken) return null;

    return new AdminRefreshToken({
      adminId: new UUID(storedRefreshToken.adminId),
      tokenId: new UUID(storedRefreshToken.tokenId),
    });
  }

  async delete(params: { tokenId: UUID }): Promise<void> {
    const tokenId = params.tokenId.getValue();

    await prismaConnection.adminRefreshToken.delete({
      where: {
        tokenId,
      },
    });
  }
}
