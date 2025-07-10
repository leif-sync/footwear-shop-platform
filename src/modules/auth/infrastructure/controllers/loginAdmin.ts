import { CookieOptions, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z, ZodError } from "zod";
import {
  ServiceContainer,
  loginCodeRepository,
  refreshTokenRepository,
} from "../../../shared/infrastructure/setupDependencies.js";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { AdminNotFoundError } from "../../../admin/domain/errors/adminNotFoundError.js";
import {
  isProduction,
  ACCESS_TOKEN_JWT_EXPIRES_SECONDS,
  REFRESH_TOKEN_JWT_EXPIRES_SECONDS,
  JWT_SECRET,
} from "../../../../environmentVariables.js";
import { validPermissionOptions } from "../../../admin/domain/validPermissions.js";
import { loginCodeConstraints } from "../../domain/loginCode.js";
import { Email } from "../../../shared/domain/email.js";
import { UUID } from "../../../shared/domain/UUID.js";
import { AdminRefreshToken } from "../../domain/adminRefreshToken.js";

const logInAdminSchema = z.object({
  email: z.string().email(),
  code: z.string().length(loginCodeConstraints.length),
});

export const adminAccessTokenName = "accessToken";
export const adminRefreshTokenName = "refreshToken";

export type adminAccessTokenPayload = {
  adminId: string;
  permissions: validPermissionOptions[];
};

export async function logInAdmin(req: Request, res: Response) {
  try {
    const { email: adminEmail, code } = logInAdminSchema.parse(req.body);

    const notificationEmail = new Email(adminEmail);
    const admin = await ServiceContainer.admin.getAdmin.run({ adminEmail });

    const loginCodeFound = await loginCodeRepository.find({
      notificationEmail,
      code,
    });

    if (!loginCodeFound) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: "Invalid credentials",
      });
      return;
    }

    if (!loginCodeFound.isValid()) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: "Invalid login code",
      });
      return;
    }

    await loginCodeRepository.delete({
      code: loginCodeFound.getCode(),
      notificationEmail,
    });

    const adminPrimitives = admin.toPrimitives();

    const accessTokenPayload: adminAccessTokenPayload = {
      adminId: adminPrimitives.adminId,
      permissions: adminPrimitives.permissions,
    };

    const accessTokenJwtSignOptions: jwt.SignOptions = {
      expiresIn: ACCESS_TOKEN_JWT_EXPIRES_SECONDS,
    };

    const accessToken = jwt.sign(
      accessTokenPayload,
      JWT_SECRET,
      accessTokenJwtSignOptions
    );

    const accessTokenCookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: ACCESS_TOKEN_JWT_EXPIRES_SECONDS * 1000, // Convert seconds to milliseconds
    };

    const refreshTokenPayload = new AdminRefreshToken({
      adminId: new UUID(adminPrimitives.adminId),
      tokenId: UUID.generateRandomUUID(),
    });

    await refreshTokenRepository.create({ refreshToken: refreshTokenPayload });

    const refreshTokenJwtSignOptions: jwt.SignOptions = {
      expiresIn: REFRESH_TOKEN_JWT_EXPIRES_SECONDS,
    };

    const refreshToken = jwt.sign(
      refreshTokenPayload.toPrimitives(),
      JWT_SECRET,
      refreshTokenJwtSignOptions
    );

    const refreshTokenCookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_JWT_EXPIRES_SECONDS * 1000, // Convert seconds to milliseconds
    };

    if (!isProduction) {
      res
        .cookie(adminAccessTokenName, accessToken, accessTokenCookieOptions)
        .cookie(adminRefreshTokenName, refreshToken, refreshTokenCookieOptions)
        .json({
          accessToken,
          refreshToken,
        });

      return;
    }

    res
      .cookie(adminAccessTokenName, accessToken, accessTokenCookieOptions)
      .cookie(adminRefreshTokenName, refreshToken, refreshTokenCookieOptions)
      .status(HTTP_STATUS.NO_CONTENT)
      .end();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Validation error",
        errors: error.issues,
      });
      return;
    }

    if (error instanceof AdminNotFoundError) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Invalid credentials",
      });
      return;
    }

    throw error;
  }
}
