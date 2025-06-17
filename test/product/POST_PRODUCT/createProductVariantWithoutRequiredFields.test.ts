import { test, expect } from "vitest";
import { api } from "../../api";
import { productsUrlPath, absoluteImagePath } from "../shared";
import { randomInt } from "node:crypto";
import { ProductToSend } from "./productBuilder";
import { createProductFieldData } from "../../../src/modules/product/infrastructure/controllers/createProduct";
import {
  createCategoryIfNotExists,
  createDetailIfNotExists,
  createSizeIfNotExists,
  createTagIfNotExists,
  loginTest,
} from "../../helper";

test(`create product variant without required fields`, async () => {
  const cookieToken = await loginTest();
  // * create initial category
  const categoryName = Date.now().toString();
  await createCategoryIfNotExists(categoryName);

  // * create initial tags
  const tagName = Date.now().toString();
  await createTagIfNotExists(tagName);

  // * create initial detail
  const detailName = Date.now().toString();
  await createDetailIfNotExists(detailName);

  // * create initial size
  const sizeValue = randomInt(1, 100000);
  await createSizeIfNotExists(sizeValue);

  const imageField = "images1";

  const product = new ProductToSend({
    variants: [
      {
        imagesAlt: [Date.now().toString(), Date.now().toString()],
        imagesField: imageField,
        tags: [tagName],
        details: [
          {
            title: detailName,
            content: Date.now().toString(),
          },
        ],
        sizes: [
          {
            sizeValue,
            stock: 1,
          },
        ],
      },
    ],
    productCategories: [categoryName],
  }).toPrimitives();

  for (const key in product.variants[0]) {
    const variantData = {
      ...product.variants[0],
      [key]: undefined,
    };

    product.variants = [variantData];

    const response = await api
      .post(productsUrlPath)
      .field(createProductFieldData, JSON.stringify(product))
      .attach(imageField, absoluteImagePath)
      .attach(imageField, absoluteImagePath)
      .set("Cookie", cookieToken);

    expect(response.ok).toBe(false);
  }
});
