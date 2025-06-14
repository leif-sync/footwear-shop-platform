import { fileTypeFromBuffer } from "file-type";
import { ImageUploader } from "../domain/imageUploader.js";
import { randomBytes } from "node:crypto";
import { access, mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  isDiskImageUploader,
  SERVER_BASE_URL,
} from "../../../environmentVariables.js";
import { AppUrl } from "../../shared/domain/appUrl.js";

export const absoluteImageStoragePath = join(process.cwd(), "public", "images");

async function createNestedFolders(folderPath: string) {
  try {
    await mkdir(folderPath, { recursive: true });
  } catch (error) {
    if (!(error instanceof Error)) throw error;

    if ((error as NodeJS.ErrnoException).code === "EACCES") {
      throw new Error("No tienes permisos para crear la carpeta.");
    } else if ((error as NodeJS.ErrnoException).code === "ENOTDIR") {
      throw new Error("La ruta no es una carpeta.");
    }

    throw error;
  }
}

(async () => {
  if (!isDiskImageUploader) return;
  await createNestedFolders(absoluteImageStoragePath);
})();

//TODO: centralizar el allowedMimeTypes
const allowedMimeTypes = new Map([
  ["image/jpeg", ["jpeg", "jpg"]],
  ["image/png", ["png"]],
  ["image/gif", ["gif"]],
  ["image/webp", ["webp"]],
  ["image/avif", ["avif"]],
]);

const fileRandomNameLength = 20;

function randomName() {
  return randomBytes(fileRandomNameLength / 2).toString("hex");
}

async function deleteFile(filePath: string) {
  try {
    await access(filePath);
    await unlink(filePath);
  } catch (error) {
    if (
      error instanceof Error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      throw new Error("FILE_NOT_FOUND");
    }

    throw error;
  }
}

export const publicImagesAPIEndpoint = `/api/v1/public/images`;

export class DiskImageUploader implements ImageUploader {
  async uploadMultipleImages(imageBuffer: Buffer[]): Promise<string[]> {
    const uploadPromises = imageBuffer.map((buffer) =>
      this.uploadSingleImage(buffer)
    );

    const imagesUrl = await Promise.all(uploadPromises);
    return imagesUrl;
  }

  async uploadSingleImage(imageBuffer: Buffer): Promise<string> {
    const fileType = await fileTypeFromBuffer(imageBuffer);
    if (!fileType) throw new Error("cannot determine file type");

    const { ext: extension, mime } = fileType;
    if (!allowedMimeTypes.has(mime)) throw new Error("invalid MIME type");

    const imageNameWithExtension = `${randomName()}.${extension}`;

    const imagePath = join(absoluteImageStoragePath, imageNameWithExtension);
    await writeFile(imagePath, imageBuffer);

    const imgUrl = new AppUrl(
      SERVER_BASE_URL,
      publicImagesAPIEndpoint,
      imageNameWithExtension
    );

    const imageUrl = imgUrl.getValue();
    return imageUrl;
  }

  async deleteImage(imageIds: string | string[]): Promise<void> {
    const imageIdsToDelete = Array.isArray(imageIds) ? imageIds : [imageIds];

    const filesDeletedPromises = imageIdsToDelete.map(async (imageId) => {
      const allowedExtensions = Array.from(allowedMimeTypes.values()).flat();
      const posibleImagePath = allowedExtensions.map(
        (extension) => `${join(absoluteImageStoragePath, imageId)}.${extension}`
      );

      let isImageDeleted = false;

      for (const imagePath of posibleImagePath) {
        try {
          await deleteFile(imagePath);
          isImageDeleted = true;
          break;
        } catch {
          continue;
        }
      }

      if (!isImageDeleted) throw new Error("FILE_NOT_FOUND");
    });

    await Promise.all(filesDeletedPromises);
  }
}
