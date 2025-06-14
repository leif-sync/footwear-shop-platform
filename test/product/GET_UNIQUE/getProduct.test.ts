import { describe, expect, test } from "vitest";
import { api } from "../../api.js";
import { productsUrlPath } from "../shared.js";
import { visibilityOptions } from "../../../src/modules/product/domain/visibility.js";
import {
  adminProductFullSchema,
  publicProductFullSchema,
} from "./productFullSchema.js";
import { createTestProduct, loginTest } from "../../helper.js";

describe("GET /products/:id", async () => {
  const cookieToken = await loginTest();

  const { productId: publicProductId } = await createTestProduct({
    productVisibility: visibilityOptions.VISIBLE,
    variants: [
      { visibility: visibilityOptions.VISIBLE },
      { visibility: visibilityOptions.HIDDEN },
    ],
  });

  const { productId: hiddenProductId } = await createTestProduct({
    productVisibility: visibilityOptions.HIDDEN,
    variants: [
      { visibility: visibilityOptions.VISIBLE },
      { visibility: visibilityOptions.HIDDEN },
    ],
  });

  test(`
    get public product by id without authentication
    `, async () => {
    const response2 = await api.get(`${productsUrlPath}/${publicProductId}`);
    expect(response2.ok).toBe(true);
    expect(response2.body).toMatchObject({
      product: expect.any(Object),
    });

    publicProductFullSchema.parse(response2.body.product);
  });

  test(`
    get hidden product by id without authentication
  `, async () => {
    const response2 = await api.get(`${productsUrlPath}/${hiddenProductId}`);
    expect(response2.ok).toBe(false);
  });

  test(`
    get product by id with authentication
  `, async () => {
    const response2 = await api
      .get(`${productsUrlPath}/${publicProductId}`)
      .set("Cookie", cookieToken);
    expect(response2.ok).toBe(true);
    expect(response2.body).toMatchObject({
      product: expect.any(Object),
    });
    adminProductFullSchema.parse(response2.body.product);
  });

  test(`
    get hidden product by id with authentication
  `, async () => {
    const response2 = await api
      .get(`${productsUrlPath}/${hiddenProductId}`)
      .set("Cookie", cookieToken);
    expect(response2.ok).toBe(true);
    expect(response2.body).toMatchObject({
      product: expect.any(Object),
    });
    adminProductFullSchema.parse(response2.body.product);
  });
});
