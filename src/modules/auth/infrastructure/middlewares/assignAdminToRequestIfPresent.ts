import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "../../../../environmentVariables.js";
import {
  adminAccessTokenName,
  adminAccessTokenPayload,
} from "../controllers/loginAdmin.js";
import jwt from "jsonwebtoken";

export async function assignAdminToRequestIfPresent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies[adminAccessTokenName];
  if (!token) return next();

  try {
    const decodedToken = jwt.verify(
      token,
      JWT_SECRET
    ) as adminAccessTokenPayload;

    req.admin = {
      adminId: decodedToken.adminId,
      permissions: decodedToken.permissions,
    };

    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.clearCookie(adminAccessTokenName);
    }
    req.admin = undefined;
    return next();
  }
}
