import { addImageToVariant } from "./addImageToVariant.js";
import { createProduct } from "./createProduct.js";
import { createVariant } from "./createVariant.js";
import { deleteImageFromVariant } from "./deleteImageFromVariant.js";
import { deleteProduct } from "./deleteProduct.js";
import { deleteVariant } from "./deleteVariant.js";
import { getProductById } from "./getProductById.js";
import { listProductPreviews } from "./listProductPreviews.js";
import { updatePartialProduct } from "./updatePartialProduct.js";
import { updatePartialVariant } from "./updatePartialVariant.js";

export const ProductController = {
  listProductPreviews,
  createProduct,
  createVariant,
  addImageToVariant,
  deleteImageFromVariant,
  getProductById,
  updatePartialProduct,
  updatePartialVariant,
  deleteProduct,
  deleteVariant,
};
