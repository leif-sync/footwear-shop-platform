import { EmailAddress } from "../../shared/domain/emailAddress.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import { prismaConnection } from "../../shared/infrastructure/prismaClient.js";
import { LoginCode } from "../domain/loginCode.js";
import { LoginCodeRepository } from "../domain/loginCodeRepository.js";

export class PostgresLoginCodeRepository implements LoginCodeRepository {
  async create(params: { loginCode: LoginCode }): Promise<void> {
    const { loginCode } = params;
    const {
      loginCodeId,
      code,
      createdAt,
      expiresInSeconds,
      notificationEmail,
      isUsed,
    } = loginCode.toPrimitives();

    await prismaConnection.loginCode.create({
      data: {
        code,
        createdAt,
        expiresInSeconds,
        isUsed,
        loginCodeId,
        notificationEmail,
      },
    });
  }

  async find(params: {
    notificationEmail: EmailAddress;
  }): Promise<LoginCode | null>;
  async find(params: {
    code: string;
    notificationEmail: EmailAddress;
  }): Promise<LoginCode | null>;
  async find(
    params:
      | { notificationEmail: EmailAddress }
      | { code: string; notificationEmail: EmailAddress }
  ): Promise<LoginCode | null> {
    const isCodePresent = "code" in params;

    if (isCodePresent) {
      const { code } = params;
      const notificationEmail = params.notificationEmail.getValue();
      const storedLoginCode = await prismaConnection.loginCode.findFirst({
        where: {
          code,
          notificationEmail,
        },
      });

      if (!storedLoginCode) return null;

      return new LoginCode({
        code: storedLoginCode.code,
        createdAt: storedLoginCode.createdAt,
        expiresInSeconds: new NonNegativeInteger(
          storedLoginCode.expiresInSeconds
        ),
        isUsed: storedLoginCode.isUsed,
        loginCodeId: new UUID(storedLoginCode.loginCodeId),
        notificationEmail: new EmailAddress(storedLoginCode.notificationEmail),
      });
    }

    const notificationEmail = params.notificationEmail.getValue();
    const storedLoginCode = await prismaConnection.loginCode.findFirst({
      where: {
        notificationEmail,
      },
    });

    if (!storedLoginCode) return null;

    return new LoginCode({
      code: storedLoginCode.code,
      createdAt: storedLoginCode.createdAt,
      expiresInSeconds: new NonNegativeInteger(
        storedLoginCode.expiresInSeconds
      ),
      isUsed: storedLoginCode.isUsed,
      loginCodeId: new UUID(storedLoginCode.loginCodeId),
      notificationEmail: new EmailAddress(storedLoginCode.notificationEmail),
    });
  }

  async delete(params: {
    code: string;
    notificationEmail: EmailAddress;
  }): Promise<void> {
    const { code } = params;
    const notificationEmail = params.notificationEmail.getValue();

    await prismaConnection.loginCode.delete({
      where: {
        code,
        notificationEmail,
      },
    });
  }
}
