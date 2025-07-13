import { ImageStorageEngine } from "../../product/domain/imageStorageEngine.js";
import { CloudinaryUploader } from "../../product/infrastructure/cloudinaryUploader.js";
import { DiskImageUploader } from "../../product/infrastructure/diskImageUploader.js";
import { FakeImageUploader } from "../../product/infrastructure/fakeImageUploader.js";
import { AppUrl } from "../domain/appUrl.js";

export enum ImageStorageOptions {
  DISK = "DISK",
  FAKE = "FAKE",
  CLOUDINARY = "CLOUDINARY",
}

export abstract class ImageStorageProviderFactory {
  static async initializeImageStorage(params: {
    imageStorageEngine: ImageStorageOptions;
    serverBaseUrl: AppUrl;
  }): Promise<ImageStorageEngine> {
    const isUsingDiskStorage =
      params.imageStorageEngine === ImageStorageOptions.DISK;

    if (isUsingDiskStorage) {
      return await DiskImageUploader.create({
        serverBaseUrl: params.serverBaseUrl,
      });
    }

    const isCloudinaryStorage =
      params.imageStorageEngine === ImageStorageOptions.CLOUDINARY;
    if (isCloudinaryStorage) return new CloudinaryUploader();

    const isFakeStorage =
      params.imageStorageEngine === ImageStorageOptions.FAKE;
    if (isFakeStorage) return new FakeImageUploader();

    throw new Error(
      `Invalid image storage engine: ${params.imageStorageEngine}. Supported options are: ${Object.values(
        ImageStorageOptions
      ).join(", ")}`
    );
  }
}
