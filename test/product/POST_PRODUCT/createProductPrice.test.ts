import { test } from "vitest";
import { executeProductValidationTest } from "./helper";
import { ProductToSend } from "./productBuilder";
import { randomInt } from "node:crypto";
import { priceTestCases } from "../priceTestCases";
import {
  createCategoryIfNotExists,
  createTagIfNotExists,
  createDetailIfNotExists,
  createSizeIfNotExists,
} from "../../helper";

priceTestCases.forEach((discount) => {
  executeProductVariantPriceTest({
    testName: discount.createTestName,
    shouldSucceed: discount.shouldSucceed,
    price: {
      baseValue: discount.baseValue,
      discountEndAt: discount.discountEndAt,
      discountStartAt: discount.discountStartAt,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
    },
  });
});

async function executeProductVariantPriceTest(params: {
  shouldSucceed: boolean;
  testName: string;
  price: {
    baseValue: number;
    discountType: string;
    discountValue: number;
    discountStartAt: string | null;
    discountEndAt: string | null;
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

    const productData = new ProductToSend({
      variants: [
        {
          tags: [newTagName],
          details: [{ title: newDetailName }],
          sizes: [{ sizeValue: newSizeValue }],
        },
      ],
      productCategories: [newCategory],
      price: params.price,
    });

    await executeProductValidationTest({
      productData,
      shouldSucceed: params.shouldSucceed,
    });
  });
}
