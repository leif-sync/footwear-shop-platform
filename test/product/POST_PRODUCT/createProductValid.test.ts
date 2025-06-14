import { test } from "vitest";
import { ProductToSend } from "./productBuilder";
import { randomInt } from "node:crypto";
import { executeProductValidationTest } from "./helper";
import { createTagIfNotExists, createDetailIfNotExists, createCategoryIfNotExists, createSizeIfNotExists } from "../../helper";


test(`create a valid product`, async () => {
  const tagName = Date.now().toString();
  await createTagIfNotExists(tagName);

  const detailName = Date.now().toString();
  await createDetailIfNotExists(detailName);

  const categoryName = Date.now().toString();
  await createCategoryIfNotExists(categoryName);

  const sizeValue = randomInt(1, 100000);
  await createSizeIfNotExists(sizeValue);

  const productData = new ProductToSend({
    productCategories: [categoryName],
    variants: [
      {
        tags: [tagName],
        details: [{ title: detailName }],
        sizes: [{ sizeValue }],
      },
    ],
  });

  await executeProductValidationTest({
    productData,
    shouldSucceed: true,
  });
});
