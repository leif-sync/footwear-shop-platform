import { describe, expect, test } from "vitest";
import { productsUrlPath } from "../shared.js";
import { visibilityOptions } from "../../../src/modules/product/domain/visibility.js";
import { api } from "../../api.js";
import { createTestProduct, loginTest } from "../../helper.js";

describe("DELETE /products/:productId/variants/:variantId", async () => {
  test("should delete a variant", async () => {
    const cookieToken = await loginTest();

    const product = await createTestProduct({
      variants: [
        { visibility: visibilityOptions.VISIBLE },
        { visibility: visibilityOptions.VISIBLE },
      ],
    });

    const productId = product.productId;
    const variantId = product.variants[0].variantId;

    const responseDelete = await api
      .delete(`${productsUrlPath}/${productId}/variants/${variantId}`)
      .set("Cookie", cookieToken);

    expect(responseDelete.ok).toBe(true);

    const responseGet = await api
      .get(`${productsUrlPath}/${productId}`)
      .set("Cookie", cookieToken);

    expect(responseGet.ok).toBe(true);
    const updatedProduct = responseGet.body.product;
    const variantExists = updatedProduct.variants.some(
      (variant) => variant.variantId === variantId
    );
    expect(variantExists).toBe(false);
  });
});
