import { UUID } from "../../shared/domain/UUID.js";

export type PrimitiveAdminRefreshToken = {
  tokenId: string;
  adminId: string;
};

export class AdminRefreshToken {
  private readonly tokenId: UUID;
  private readonly adminId: UUID;

  constructor(params: { tokenId: UUID; adminId: UUID }) {
    this.tokenId = UUID.clone(params.tokenId);
    this.adminId = UUID.clone(params.adminId);
  }

  getId(): string {
    return this.tokenId.getValue();
  }

  getAdminId(): string {
    return this.adminId.getValue();
  }

  static clone(refreshToken: AdminRefreshToken): AdminRefreshToken {
    return new AdminRefreshToken({
      tokenId: UUID.clone(refreshToken.tokenId),
      adminId: UUID.clone(refreshToken.adminId),
    });
  }

  toPrimitives(): PrimitiveAdminRefreshToken {
    return {
      tokenId: this.tokenId.getValue(),
      adminId: this.adminId.getValue(),
    };
  }
}
