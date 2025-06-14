import { test, expect } from "vitest";
import { api } from "../../api.js";
import {
  absoluteImagePath,
  productsUrlPath,
} from "../shared.js";
import { createNewImageForVariantField } from "../../../src/modules/product/infrastructure/controllers/addImageToVariant";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus.js";
import { createTestProduct } from "../../helper.js";

test("create new image for variant without auth", async () => {
  const product = await createTestProduct();

  const productId = product.productId;
  const variantId = product.variants[0].variantId;

  const response = await api
    .post(`${productsUrlPath}/${productId}/variants/${variantId}/images`)
    .attach(createNewImageForVariantField, absoluteImagePath)
    .field("imageAlt", "test alt")

  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
});
