import { describe, test, expect } from "vitest";
import { api } from "../../api";
import { absoluteImagePath } from "../shared";
import { productsUrlPath } from "../shared";
import { createVariantFieldNames } from "../../../src/modules/product/infrastructure/controllers/createVariant";
import { createUniqueVariantSchemaType } from "../../../src/modules/product/infrastructure/schemas/variant";
import { visibilityOptions } from "../../../src/modules/product/domain/visibility";
import {
  createDetailIfNotExists,
  createSizeIfNotExists,
  createTagIfNotExists,
  createTestProduct,
  loginTest,
} from "../../helper";

describe("POST /products/productId/variants", async () => {
  const cookieToken = await loginTest();
  test("create new product variant without required fields", async () => {
    const newDetailName = Date.now().toString();
    await createDetailIfNotExists(newDetailName);

    const newSizeValue = 10;
    await createSizeIfNotExists(newSizeValue);

    const newTag = Date.now().toString();
    await createTagIfNotExists(newTag);

    const product = await createTestProduct();

    const productId = product.productId;
    const createVariantsUrlPath = `${productsUrlPath}/${productId}/variants`;

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
          sizeValue: newSizeValue,
          stock: 10,
        },
      ],
      tags: [newTag],
      visibility: visibilityOptions.VISIBLE,
    };

    for (const key in newVariant) {
      const variantWithoutRequiredField = {
        ...newVariant,
        [key]: undefined,
      };

      const response = await api
        .post(createVariantsUrlPath)
        .field(
          createVariantFieldNames.variantData,
          JSON.stringify(variantWithoutRequiredField)
        )
        .attach(createVariantFieldNames.variantImages, absoluteImagePath)
        .attach(createVariantFieldNames.variantImages, absoluteImagePath)
        .set("Cookie", cookieToken);

      expect(response.ok).toBe(false);
    }
  });
});
