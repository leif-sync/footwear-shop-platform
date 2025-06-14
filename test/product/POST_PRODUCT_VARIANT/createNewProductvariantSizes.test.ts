import { test, expect } from "vitest";
import { api } from "../../api";
import { absoluteImagePath } from "../shared";
import { productsUrlPath } from "../shared";
import { createVariantFieldNames } from "../../../src/modules/product/infrastructure/controllers/createVariant";
import { createUniqueVariantSchemaType } from "../../../src/modules/product/infrastructure/schemas/variant";
import { visibilityOptions } from "../../../src/modules/product/domain/visibility";
import { randomInt } from "node:crypto";
import { sizesTestCases } from "../sizesTestCases";
import {
  createTagIfNotExists,
  createDetailIfNotExists,
  createSizeIfNotExists,
  createTestProduct,
  loginTest,
} from "../../helper";

sizesTestCases.forEach((testcase) => {
  executeProductVariantTest({
    shouldSucceed: testcase.shouldSucceed,
    testName: testcase.createVariantTestName,
    createSize: testcase.createSize,
    size: {
      sizeValue: testcase.sizeValue,
      stock: testcase.stock,
    },
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
    const cookieToken = await loginTest();
    const newTag = Date.now().toString();
    await createTagIfNotExists(newTag);

    const newDetailName = Date.now().toString();
    await createDetailIfNotExists(newDetailName);

    const newSizeValue = randomInt(1, 100000);
    await createSizeIfNotExists(newSizeValue);

    if (params.createSize) {
      await createSizeIfNotExists(params.size?.sizeValue ?? newSizeValue);
    }

    const newVariant: createUniqueVariantSchemaType = {
      details: [
        {
          title: newDetailName,
          content: Date.now().toString(),
        },
      ],
      hexColor: "#FFFFFF",
      imagesAlt: [Date.now().toString(), Date.now().toString()],
      sizes: [
        {
          sizeValue: params.size?.sizeValue ?? newSizeValue,
          stock: params.size?.stock ?? 10,
        },
      ],
      tags: [newTag],
      visibility: visibilityOptions.VISIBLE,
    };

    const product = await createTestProduct();
    const productId = product.productId;
    const createVariantsUrlPath = `${productsUrlPath}/${productId}/variants`;
    const response = await api
      .post(createVariantsUrlPath)
      .field(createVariantFieldNames.variantData, JSON.stringify(newVariant))
      .attach(createVariantFieldNames.variantImages, absoluteImagePath)
      .attach(createVariantFieldNames.variantImages, absoluteImagePath)
      .set("Cookie", cookieToken);

    expect(response.ok).toBe(params.shouldSucceed);
  });
}
