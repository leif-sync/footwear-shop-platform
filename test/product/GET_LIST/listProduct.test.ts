import { describe, test, expect } from "vitest";
import { z } from "zod";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import { api } from "../../api";
import {
  productPreviewSchemaForAdmin,
  publicProductPreviewSchema,
} from "./productPreviewSchema";
import { productsUrlPath } from "../shared";
import { visibilityOptions } from "../../../src/modules/product/domain/visibility";
import { createTestProduct, loginTest } from "../../helper";

describe("GET /products", async () => {
  const cookieToken = await loginTest();
  const defaultLimit = 100;
  const defaultOffset = 0;
  const listProductsPath = `${productsUrlPath}?limit=${defaultLimit}&offset=${defaultOffset}`;

  // create public product
  await createTestProduct();
  // create hidden product
  const { productId: hiddenProductId } = await createTestProduct({
    productVisibility: visibilityOptions.HIDDEN,
    variants: [
      { visibility: visibilityOptions.VISIBLE },
      { visibility: visibilityOptions.HIDDEN },
    ],
  });

  test(`list products with valid limit and offset`, async () => {
    const response = await api.get(listProductsPath);
    const publicProductsSchema = z.array(publicProductPreviewSchema);
    const { body, status } = response;

    expect(status).equals(HTTP_STATUS.OK);
    expect(body).toMatchObject({
      products: expect.any(Array),
    });
    publicProductsSchema.parse(body.products);
    expect(response.body.products.length).toBeLessThanOrEqual(defaultLimit);
  });

  test(`
    list hidden products without authentication
  `, async () => {
    const response = await api.get(listProductsPath);
    const publicProductsSchema = z.array(publicProductPreviewSchema);
    const { body, status } = response;

    expect(status).equals(HTTP_STATUS.OK);
    expect(body).toMatchObject({
      products: expect.any(Array),
    });
    const parsedProducts = publicProductsSchema.parse(body.products);
    expect(response.body.products.length).toBeLessThanOrEqual(defaultLimit);
    parsedProducts.forEach((product) => {
      expect(product.productId).not.toEqual(hiddenProductId);
    });
  });

  test(`
    list products with invalid limit and offset,
    `, async () => {
    const invalidOffset = -1;
    const invalidLimit = 0;
    const response = await api.get(
      `${productsUrlPath}?limit=${invalidLimit}&offset=${invalidOffset}`
    );

    expect(response.ok).equals(false);
  });

  test(`
    list products with admin authentication
  `, async () => {
    const response = await api.get(listProductsPath).set("Cookie", cookieToken);
    const adminProductsSchema = z.array(productPreviewSchemaForAdmin);
    const { body, status } = response;

    expect(status).equals(HTTP_STATUS.OK);
    expect(body).toMatchObject({
      products: expect.any(Array),
    });

    adminProductsSchema.parse(body.products);
    expect(response.body.products.length).toBeLessThanOrEqual(defaultLimit);
  });
});
