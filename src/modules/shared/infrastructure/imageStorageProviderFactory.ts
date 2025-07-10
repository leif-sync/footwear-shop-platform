import { ImageStorageEngine } from "../../product/domain/imageStorageEngine.js";
import { DiskImageUploader } from "../../product/infrastructure/diskImageUploader.js";
import { FakeImageUploader } from "../../product/infrastructure/fakeImageUploader.js";
import { AppUrl } from "../domain/appUrl.js";

export enum ImageStorageOptions {
  DISK = "DISK",
  FAKE = "FAKE",
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

    return new FakeImageUploader();
  }
}