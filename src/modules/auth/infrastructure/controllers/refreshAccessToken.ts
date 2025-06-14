import { CookieOptions, Request, Response } from "express";
import {
  adminAccessTokenName,
  adminAccessTokenPayload,
  adminRefreshTokenName,
} from "./loginAdmin.js";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import {
  refreshTokenRepository,
  ServiceContainer,
} from "../../../shared/infrastructure/serviceContainer.js";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_JWT_EXPIRES_SECONDS,
  isProduction,
  JWT_SECRET,
} from "../../../../environmentVariables.js";
import { UUID } from "../../../shared/domain/UUID.js";
import { adminRefreshTokenPayload } from "../../domain/adminRefreshToken.js";

export async function refreshAccessToken(req: Request, res: Response) {
  const refreshTokenFromCookies = req.cookies[adminRefreshTokenName] as
    | string
    | undefined;

  if (!refreshTokenFromCookies) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: "Refresh token is required",
    });
    return;
  }

  let tokenPayload: adminRefreshTokenPayload;

  try {
    tokenPayload = jwt.verify(
      refreshTokenFromCookies,
      JWT_SECRET
    ) as adminRefreshTokenPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: "Invalid refresh token",
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: "Refresh token has expired",
      });
      return;
    }

    throw error;
  }
  const tokenId = new UUID(tokenPayload.tokenId);

  const refreshTokenFound = await refreshTokenRepository.find({ tokenId });

  if (!refreshTokenFound) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: "Invalid refresh token",
    });
    return;
  }

  const admin = await ServiceContainer.admin.getAdmin.run({
    adminId: refreshTokenFound.getAdminId(),
  });

  const newAccessTokenPayload: adminAccessTokenPayload = {
    adminId: admin.getAdminId(),
    permissions: admin.getPermissions(),
  };

  const accessTokenJwtSignOptions: jwt.SignOptions = {
    expiresIn: ACCESS_TOKEN_JWT_EXPIRES_SECONDS,
  };

  const newAccessToken = jwt.sign(
    newAccessTokenPayload,
    JWT_SECRET,
    accessTokenJwtSignOptions
  );

  const accessTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: ACCESS_TOKEN_JWT_EXPIRES_SECONDS * 1000, // Convert seconds to milliseconds
  };

  res
    .cookie(adminAccessTokenName, newAccessToken, accessTokenCookieOptions)
    .status(HTTP_STATUS.NO_CONTENT)
    .end();
}
