import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { basePath } from "../api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const absoluteImagesDir = join(__dirname, "images");
export const absoluteImagePath = join(absoluteImagesDir, "img1.jpeg");
export const productsUrlPath = `${basePath}/products`;
