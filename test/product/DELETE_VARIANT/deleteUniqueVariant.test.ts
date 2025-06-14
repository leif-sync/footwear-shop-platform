import { describe, expect, test } from "vitest";
import { productsUrlPath } from "../shared.js";
import { api } from "../../api.js";
import { createTestProduct, loginTest } from "../../helper.js";

describe("DELETE /products/:productId/variants/:variantId", async () => {
  test("delete unique variant", async () => {
    const cookieToken = await loginTest();
    const product = await createTestProduct();

    const productId = product.productId;
    const variantId = product.variants[0].variantId;

    const responseDelete = await api
      .delete(`${productsUrlPath}/${productId}/variants/${variantId}`)
      .set("Cookie", cookieToken);

    expect(responseDelete.ok).toBe(false);
  });
});
