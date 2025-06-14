import { api } from "../../api.js";
import { describe, expect, test } from "vitest";
import { productsUrlPath } from "../shared.js";
import { updatePartialVariantSchemaType } from "../../../src/modules/product/infrastructure/schemas/variant.js";
import { visibilityOptions } from "../../../src/modules/product/domain/visibility.js";
import {
  createTestProduct,
  createDetailIfNotExists,
  createSizeIfNotExists,
  createTagIfNotExists,
  loginTest,
} from "../../helper.js";

describe("PATCH /products/:productId/variants/:variantId", async () => {
  const cookieToken = await loginTest();
  test("update unique variant visibility to hidden", async () => {
    const product = await createTestProduct();

    const newDetail = Date.now().toString();
    await createDetailIfNotExists(newDetail);

    const newSizeValue = 20;
    await createSizeIfNotExists(newSizeValue);

    const newTag = Date.now().toString();
    await createTagIfNotExists(newTag);

    const productId = product.productId;
    const variantId = product.variants[0].variantId;
    const path = `${productsUrlPath}/${productId}/variants/${variantId}`;

    const updateVariant: updatePartialVariantSchemaType = {
      visibility: visibilityOptions.HIDDEN,
    };

    const responsePatch = await api
      .patch(path)
      .send(updateVariant)
      .set("Cookie", cookieToken);

    expect(responsePatch.ok).toBe(false);
  });
});
