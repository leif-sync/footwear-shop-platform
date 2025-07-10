import { ImageStorageEngine } from "../domain/imageStorageEngine.js";

export class FakeImageUploader implements ImageStorageEngine {
  private urlGenerator() {
    return `http://fake-image-url.com/${Math.random()
      .toString(36)
      .substring(7)}`;
  }

  async uploadMultipleImages(imageBuffers: Buffer[]): Promise<string[]> {
    return imageBuffers.map(() => this.urlGenerator());
  }

  async uploadSingleImage(_imageBuffer: Buffer): Promise<string> {
    return this.urlGenerator();
  }

  async deleteImage(_imageUrl: string | string[]): Promise<void> {
    return;
  }
}
