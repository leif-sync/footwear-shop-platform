import { Request, Response } from "express";
import { HTTP_STATUS } from "./modules/shared/infrastructure/httpStatus.js";

export async function expressNotFoundHandler(req: Request, res: Response) {
  res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Page not found" });
}
