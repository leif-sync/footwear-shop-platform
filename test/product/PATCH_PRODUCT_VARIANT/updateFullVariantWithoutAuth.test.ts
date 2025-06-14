import { api } from "../../api.js";
import { describe, expect, test } from "vitest";
import {
  productsUrlPath,
} from "../shared.js";
import { updatePartialVariantSchemaType } from "../../../src/modules/product/infrastructure/schemas/variant.js";
import { visibilityOptions } from "../../../src/modules/product/domain/visibility.js";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus.js";
import { createTestProduct, createDetailIfNotExists, createSizeIfNotExists, createTagIfNotExists } from "../../helper.js";

describe("PATCH /products/:productId/variants/:variantId", async () => {
  test("update full variant without auth", async () => {
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
      details: [{ content: Date.now().toString(), title: newDetail }],
      hexColor: "#000000",
      sizes: [{ sizeValue: newSizeValue, stock: 10 }],
      tags: [newTag],
      visibility: visibilityOptions.VISIBLE,
    };

    const responsePatch = await api
      .patch(path)
      .send(updateVariant)

    expect(responsePatch.ok).toBe(false);
    expect(responsePatch.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });
});
