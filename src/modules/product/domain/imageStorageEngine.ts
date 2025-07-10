export abstract class ImageStorageEngine {
  abstract uploadSingleImage(imageBuffer: Buffer): Promise<string>;
  abstract uploadMultipleImages(imageBuffers: Buffer[]): Promise<string[]>;

  abstract deleteImage(imageId: string | string[]): Promise<void>;
}
