import { test, expect } from "vitest";
import { api } from "../../api.js";
import { productsUrlPath } from "../shared.js";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus.js";
import { createTestProduct, loginTest } from "../../helper.js";

test("createNewImageForVariant", async () => {
  const cookieToken = await loginTest();
  const product = await createTestProduct();
  const productId = product.productId;
  const variantId = product.variants[0].variantId;

  const imageId = (
    product.variants[0].images[0].imageUrl.split("/").pop() ?? ""
  )
    .split(".")
    .shift();

  const deleteResponse = await api
    .delete(
      `${productsUrlPath}/${productId}/variants/${variantId}/images/${imageId}`
    )
    .set("Cookie", cookieToken);

  expect(deleteResponse.ok).toBe(false);
  expect(deleteResponse.status).not.toBe(HTTP_STATUS.NOT_FOUND);
});
