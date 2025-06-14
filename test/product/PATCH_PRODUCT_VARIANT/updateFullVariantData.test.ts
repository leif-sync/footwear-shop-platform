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
  test("update full variant data", async () => {
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

    const hexColor = "#000000";

    const updateVariant: updatePartialVariantSchemaType = {
      details: [{ content: Date.now().toString(), title: newDetail }],
      hexColor,
      sizes: [{ sizeValue: newSizeValue, stock: 10 }],
      tags: [newTag],
      visibility: visibilityOptions.VISIBLE,
    };

    const responsePatch = await api
      .patch(path)
      .send(updateVariant)
      .set("Cookie", cookieToken);

    expect(responsePatch.ok).toBe(true);

    const responseGet = await api.get(`${productsUrlPath}/${productId}`);
    expect(responseGet.ok).toBe(true);
    const variant = responseGet.body.product.variants.find(
      (variant) => variant.variantId === variantId
    );

    expect(Boolean(variant)).toBe(true);
    expect(variant.details).toMatchObject([
      { content: expect.any(String), title: newDetail },
    ]);
    expect(variant.hexColor).equal(hexColor);
    expect(variant.sizes).toMatchObject([
      { sizeValue: newSizeValue, stock: 10 },
    ]);
    expect(variant.tags).toMatchObject([newTag]);
    expect(variant.visibility).equal(visibilityOptions.VISIBLE);
  });
});
