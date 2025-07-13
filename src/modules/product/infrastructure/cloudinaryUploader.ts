import { ImageStorageEngine } from "../domain/imageStorageEngine.js";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import pLimit from "p-limit";

const maxConcurrentUploads = 10;
const limit = pLimit(maxConcurrentUploads);

cloudinary.config({
  secure: true,
});

async function uploadImageStream(imageBuffer: Buffer<ArrayBufferLike>) {
  return await new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "image" }, (error, result) => {
        if (error) return reject(error);
        if (result) return resolve(result);
      })
      .end(imageBuffer);
  });
}

export class CloudinaryUploader implements ImageStorageEngine {
  async uploadSingleImage(imageBuffer: Buffer): Promise<string> {
    const uploadResult = await uploadImageStream(imageBuffer);
    return uploadResult.secure_url;
  }

  async uploadMultipleImages(imageBuffers: Buffer[]): Promise<string[]> {
    const uploadPromises = imageBuffers.map((buffer) =>
      limit(() => this.uploadSingleImage(buffer))
    );

    const imagesUrl = await Promise.all(uploadPromises);
    return imagesUrl;
  }

  async deleteImage(imageId: string | string[]): Promise<void> {
    const imageIdsToDelete = Array.isArray(imageId) ? imageId : [imageId];

    const deletePromises = imageIdsToDelete.map((id) =>
      limit(() => cloudinary.uploader.destroy(id))
    );

    await Promise.all(deletePromises);
  }
}
