import { test } from "vitest";
import { executeProductValidationTest } from "./helper";
import { ProductToSend } from "./productBuilder";
import { randomInt } from "node:crypto";
import { sizesTestCases } from "../sizesTestCases";
import { createCategoryIfNotExists, createTagIfNotExists, createDetailIfNotExists, createSizeIfNotExists } from "../../helper";

sizesTestCases.forEach((size) => {
  executeProductVariantTest({
    shouldSucceed: size.shouldSucceed,
    testName: size.createProductTestName,
    size: {
      sizeValue: size.sizeValue,
      stock: size.stock,
    },
    createSize: size.createSize,
  });
});

async function executeProductVariantTest(params: {
  shouldSucceed: boolean;
  testName: string;
  createSize?: boolean;
  size?: {
    sizeValue?: number;
    stock?: number;
  };
}) {
  test(params.testName, async () => {
    const newCategory = Date.now().toString();
    await createCategoryIfNotExists(newCategory);

    const newTagName = Date.now().toString();
    await createTagIfNotExists(newTagName);

    const newDetailName = Date.now().toString();
    await createDetailIfNotExists(newDetailName);

    const newSizeValue = randomInt(1, 100000);
    await createSizeIfNotExists(newSizeValue);

    if (params.createSize) {
      await createSizeIfNotExists(params.size?.sizeValue ?? newSizeValue);
    }

    const productData = new ProductToSend({
      variants: [
        {
          tags: [newTagName],
          details: [{ title: newDetailName }],
          sizes: [
            {
              sizeValue: params.size?.sizeValue ?? newSizeValue,
              stock: params.size?.stock,
            },
          ],
        },
      ],
      productCategories: [newCategory],
    });

    await executeProductValidationTest({
      productData,
      shouldSucceed: params.shouldSucceed,
    });
  });
}
