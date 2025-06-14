import { test, describe } from "vitest";
import { ProductToSend } from "./productBuilder.js";
import { randomInt } from "node:crypto";
import { executeProductValidationTest } from "./helper.js";
import { createCategoryIfNotExists, createTagIfNotExists, createDetailIfNotExists, createSizeIfNotExists } from "../../helper.js";

describe("POST /products", async () => {
  const newCategoryName = Date.now().toString();
  await createCategoryIfNotExists(newCategoryName);

  const newTag = Date.now().toString();
  await createTagIfNotExists(newTag);

  const newDetailName = Date.now().toString();
  await createDetailIfNotExists(newDetailName);

  const newSizeValue = randomInt(1, 100000);
  await createSizeIfNotExists(newSizeValue);

  test(`create product variant with invalid image count`, async () => {
    const productData = new ProductToSend({
      variants: [
        {
          imagesAlt: [Date.now().toString()] as any,
          tags: [newTag],
          details: [{ title: newDetailName }],
          sizes: [{ sizeValue: newSizeValue }],
        },
      ],
      productCategories: [newCategoryName],
    });

    await executeProductValidationTest({
      productData,
      shouldSucceed: false,
    });
  });

  test("create product variant with invalid tag", async () => {
    const invalidTag = Date.now().toString();

    const productData = new ProductToSend({
      variants: [
        {
          tags: [invalidTag],
          details: [{ title: newDetailName }],
          sizes: [{ sizeValue: newSizeValue }],
        },
      ],
      productCategories: [newCategoryName],
    });

    await executeProductValidationTest({
      productData,
      shouldSucceed: false,
    });
  });

  test("create product variant with invalid visibility", async () => {
    const invalidVisibility = "INVALID_VISIBILITY";

    const productData = new ProductToSend({
      variants: [
        {
          tags: [newTag],
          details: [{ title: newDetailName }],
          sizes: [{ sizeValue: newSizeValue }],
          visibility: invalidVisibility,
        },
      ],
      productCategories: [newCategoryName],
    });

    await executeProductValidationTest({
      productData,
      shouldSucceed: false,
    });
  });

  test("create product variant with invalid hex color", async () => {
    const invalidHexColor = "#invalidHexColor";

    const productData = new ProductToSend({
      variants: [
        {
          hexColor: invalidHexColor,
          tags: [newTag],
          details: [{ title: newDetailName }],
          sizes: [{ sizeValue: newSizeValue }],
        },
      ],
      productCategories: [newCategoryName],
    });

    await executeProductValidationTest({
      productData,
      shouldSucceed: false,
    });
  });
});
