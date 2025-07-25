import { RequestHandler, NextFunction, Request, Response } from "express";
import { JWT_SECRET, isDevelopment } from "../../../../environmentVariables.js";
import { validPermissionOptions } from "../../../admin/domain/validPermissions.js";
import { HTTP_STATUS } from "../../../shared/infrastructure/httpStatus.js";
import { logger } from "../../../shared/infrastructure/setupDependencies.js";
import {
  adminAccessTokenName,
  adminAccessTokenPayload,
} from "../controllers/loginAdmin.js";
import jwt from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    admin?: {
      adminId: string;
      permissions: validPermissionOptions[];
    };
  }
}

/**
 * Middleware to check if the admin has the required permissions.
 * @param params - The parameters for the middleware.
 * @param params.permission - The permission or array of permissions to check.
 * @returns A request handler function.
 */
export function hasPermission(params: {
  permission: validPermissionOptions | validPermissionOptions[];
}): RequestHandler {
  const { permission } = params;
  const permissions = Array.isArray(permission) ? permission : [permission];

  return async (req: Request, res: Response, next: NextFunction) => {
    await permissionHandler({
      request: req,
      response: res,
      next,
      permissions,
    });
  };
}

/**
 * Handles the permission checking logic.
 * This function checks if the admin has the required permissions
 * based on the provided access token in the request cookies.
 * If the token is valid and the permissions match, it assigns the admin
 * information to the request object and calls the next middleware.
 * If the token is invalid or the permissions do not match, it responds with an error.
 * @param params - The parameters for the permission handler.
 * @param params.request - The request object.
 * @param params.response - The response object.
 * @param params.next - The next middleware function.
 * @param params.permissions - The permissions to check against.
 */
async function permissionHandler(params: {
  request: Request;
  response: Response;
  next: NextFunction;
  permissions: validPermissionOptions[];
}) {
  const { request, response, next, permissions } = params;
  const accessToken = request.cookies[adminAccessTokenName];

  if (!accessToken) {
    response.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: "Unauthorized",
    });
    return;
  }

  try {
    const decodedToken = jwt.verify(
      accessToken,
      JWT_SECRET
    ) as adminAccessTokenPayload;

    const adminPermissions = decodedToken.permissions;
    const hasPermission = permissions.every((permission) =>
      adminPermissions.includes(permission)
    );

    if (!hasPermission) {
      response.status(HTTP_STATUS.FORBIDDEN).json({
        message: "Unauthorized",
      });
      return;
    }

    request.admin = {
      adminId: decodedToken.adminId,
      permissions: decodedToken.permissions,
    };

    if (isDevelopment) {
      logger.debug({
        message: "Admin has permission",
        meta: {
          permissions: decodedToken.permissions,
          requiredPermissions: permissions,
        },
      });
    }
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      response
        .status(HTTP_STATUS.UNAUTHORIZED)
        .clearCookie(adminAccessTokenName)
        .json({
          message: "Token expired",
        });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      if (isDevelopment) {
        logger.error({
          message: "Invalid token",
          error,
        });
      }
    }

    response.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: "Unauthorized",
    });
    return;
  }
}
