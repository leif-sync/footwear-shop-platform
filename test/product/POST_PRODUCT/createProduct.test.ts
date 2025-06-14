import { test, describe, expect } from "vitest";
import { api } from "../../api.js";
import { ProductToSend } from "./productBuilder.js";
import { absoluteImagePath, productsUrlPath } from "../shared.js";
import { randomInt } from "node:crypto";
import { executeProductValidationTest } from "./helper.js";
import { createProductFieldData } from "../../../src/modules/product/infrastructure/controllers/createProduct.js";
import {
  createCategoryIfNotExists,
  createTagIfNotExists,
  createDetailIfNotExists,
  createSizeIfNotExists,
  loginTest,
} from "../../helper.js";

describe("POST /products", async () => {
  const cookieToken = await loginTest();
  const newCategoryName = Date.now().toString();
  await createCategoryIfNotExists(newCategoryName);

  const newTag = Date.now().toString();
  await createTagIfNotExists(newTag);

  const newDetailName = Date.now().toString();
  await createDetailIfNotExists(newDetailName);

  const newSizeValue = randomInt(1, 100000);
  await createSizeIfNotExists(newSizeValue);

  const imagesField = "images1";

  test(`create product without required fields`, async () => {
    const product = new ProductToSend({
      variants: [
        {
          tags: [newTag],
          details: [{ title: newDetailName }],
          sizes: [{ sizeValue: newSizeValue }],
          imagesAlt: [Date.now().toString(), Date.now().toString()],
          imagesField,
        },
      ],
      productCategories: [newCategoryName],
    }).toPrimitives();

    for (const key in product) {
      const productData = {
        ...product,
        [key]: undefined,
      };

      const response = await api
        .post(productsUrlPath)
        .field(createProductFieldData, JSON.stringify(productData))
        .attach(imagesField, absoluteImagePath)
        .attach(imagesField, absoluteImagePath)
        .set("Cookie", cookieToken);

      expect(response.ok).toBe(false);
    }
  });

  test("create product with invalid category", async () => {
    const invalidCategory = Date.now().toString();

    const productData = new ProductToSend({
      variants: [
        {
          tags: [newTag],
          details: [{ title: newDetailName }],
          sizes: [{ sizeValue: newSizeValue }],
        },
      ],
      productCategories: [invalidCategory],
    });

    await executeProductValidationTest({
      productData,
      shouldSucceed: false,
    });
  });

  test("create product with invalid visibility", async () => {
    const invalidVisibility = "INVALID_VISIBILITY";

    const productData = new ProductToSend({
      variants: [
        {
          tags: [newTag],
          details: [{ title: newDetailName }],
          sizes: [{ sizeValue: newSizeValue }],
        },
      ],
      productCategories: [newCategoryName],
      visibility: invalidVisibility,
    });

    await executeProductValidationTest({
      productData,
      shouldSucceed: false,
    });
  });
});
