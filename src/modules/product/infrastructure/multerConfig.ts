import { ErrorCode, FileFilterCallback } from "multer";
import { Request } from "express";

export const allowedMimeTypes = new Map([
  ["image/jpeg", "jpeg"],
  ["image/png", "png"],
  ["image/gif", "gif"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]); // tipos MIME permitidos

export function multerFileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  // Verificar si el tipo de archivo está permitido
  const isValidMimetype = allowedMimeTypes.has(file.mimetype);
  if (!isValidMimetype) return cb(new Error("Invalid MIME type")); // TODO: create a custom error

  // Aceptar el archivo si el tipo MIME y la extensión son válidos
  cb(null, true);
}

export const messagesFromMulterError = new Map<ErrorCode, string>([
  ["LIMIT_FIELD_COUNT", "Too many fields"],
  ["LIMIT_FIELD_KEY", "Field name too long"],
  ["LIMIT_FIELD_VALUE", "Field value too long"],
  ["LIMIT_FILE_COUNT", "Too many files"],
  ["LIMIT_FILE_SIZE", "File too large"],
  ["LIMIT_PART_COUNT", "Too many parts"],
  ["LIMIT_UNEXPECTED_FILE", "Unexpected field"],
]);
