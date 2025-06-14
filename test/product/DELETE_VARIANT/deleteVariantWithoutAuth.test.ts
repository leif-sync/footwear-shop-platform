import { describe, expect, test } from "vitest";
import { productsUrlPath } from "../shared.js";
import { visibilityOptions } from "../../../src/modules/product/domain/visibility.js";
import { api } from "../../api.js";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus.js";
import { createTestProduct } from "../../helper.js";

describe("DELETE /products/:productId/variants/:variantId", async () => {
  test("Delete variant without authentication", async () => {
    const product = await createTestProduct({
      variants: [
        { visibility: visibilityOptions.VISIBLE },
        { visibility: visibilityOptions.VISIBLE },
      ],
    });

    const productId = product.productId;
    const variantId = product.variants[0].variantId;

    const responseDelete = await api.delete(
      `${productsUrlPath}/${productId}/variants/${variantId}`
    );

    expect(responseDelete.ok).toBe(false);
    expect(responseDelete.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });
});
