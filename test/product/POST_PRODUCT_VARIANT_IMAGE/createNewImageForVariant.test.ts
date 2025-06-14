import { test, expect } from "vitest";
import { api } from "../../api.js";
import { absoluteImagePath, productsUrlPath } from "../shared.js";
import { createNewImageForVariantField } from "../../../src/modules/product/infrastructure/controllers/addImageToVariant";
import { createTestProduct, loginTest } from "../../helper.js";

test("createNewImageForVariant", async () => {
  const cookieToken = await loginTest();
  const product = await createTestProduct();

  const productId = product.productId;
  const variantId = product.variants[0].variantId;

  const response = await api
    .post(`${productsUrlPath}/${productId}/variants/${variantId}/images`)
    .attach(createNewImageForVariantField, absoluteImagePath)
    .field("imageAlt", "test alt")
    .set("Cookie", cookieToken);

  expect(response.ok).toBe(true);
  expect(response.body).toMatchObject({
    image: {
      imageUrl: expect.any(String),
    },
  });

  const imageUrl = response.body.image.imageUrl;

  const responseGet = await api
    .get(`${productsUrlPath}/${productId}`)
    .set("Cookie", cookieToken);
  expect(responseGet.ok).toBe(true);
  expect(responseGet.body.product).toMatchObject({
    variants: expect.any(Array),
  });

  const variant = responseGet.body.product.variants.find(
    (variant) => variant.variantId === variantId
  );
  expect(variant).toBeDefined();
  const isImagePresent = variant.images.some(
    (image) => image.imageUrl === imageUrl
  );

  expect(isImagePresent).toBe(true);
});
