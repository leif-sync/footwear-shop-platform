import { HTTP_STATUS } from "./modules/shared/infrastructure/httpStatus.js";
import { Request, Response, NextFunction } from "express";
import { logger } from "./modules/shared/infrastructure/logger.js";

export async function expressErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.fatal({
    message: "Express error handler",
    error: err instanceof Error ? err : undefined,
    meta: {
      method: req.method,
      url: req.url,
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers,
      ip: req.ip,
      originalUrl: req.originalUrl,
      protocol: req.protocol,
      hostname: req.hostname,
    },
  });

  res
    .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    .json({ message: "Internal server error" });
}
