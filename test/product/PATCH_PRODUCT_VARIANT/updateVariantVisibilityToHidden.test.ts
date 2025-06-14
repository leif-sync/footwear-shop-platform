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
    const product = await createTestProduct({
      variants: [
        { visibility: visibilityOptions.VISIBLE },
        { visibility: visibilityOptions.VISIBLE },
      ],
    });

    const newDetail = Date.now().toString();
    await createDetailIfNotExists(newDetail);

    const newSizeValue = 20;
    await createSizeIfNotExists(newSizeValue);

    const newTag = Date.now().toString();
    await createTagIfNotExists(newTag);

    const variant = product.variants[1];
    const productId = product.productId;
    const variantId = variant.variantId;
    const path = `${productsUrlPath}/${productId}/variants/${variantId}`;

    const updateVariant: updatePartialVariantSchemaType = {
      details: [{ content: Date.now().toString(), title: newDetail }],
      hexColor: "#000000",
      sizes: [{ sizeValue: newSizeValue, stock: 10 }],
      tags: [newTag],
      visibility: visibilityOptions.HIDDEN,
    };

    const responsePatch = await api
      .patch(path)
      .send(updateVariant)
      .set("Cookie", cookieToken);

    expect(responsePatch.ok).toBe(true);

    const responseGetWithoutAuth = await api.get(
      `${productsUrlPath}/${productId}`
    );
    expect(responseGetWithoutAuth.ok).toBe(true);
    expect(responseGetWithoutAuth.body.product).toMatchObject({
      variants: expect.any(Array),
    });

    responseGetWithoutAuth.body.product.variants.forEach((variant) => {
      expect(variant.variantId).not.equals(variantId);
    });

    const responseGetWithAuth = await api
      .get(`${productsUrlPath}/${productId}`)
      .set("Cookie", cookieToken);
    expect(responseGetWithAuth.ok).toBe(true);
    expect(responseGetWithAuth.body.product).toMatchObject({
      variants: expect.any(Array),
    });

    let isVariantPresent = false;

    responseGetWithAuth.body.product.variants.forEach((variant) => {
      if (variant.variantId === variantId) {
        isVariantPresent = true;
      }
    });

    expect(isVariantPresent).toBe(true);
  });
});
