import { describe, test, expect } from "vitest";
import { api } from "../../api";
import {
  absoluteImagePath,

} from "../shared";
import { productsUrlPath } from "../shared";
import { createVariantFieldNames } from "../../../src/modules/product/infrastructure/controllers/createVariant";
import { createUniqueVariantSchemaType } from "../../../src/modules/product/infrastructure/schemas/variant";
import { visibilityOptions } from "../../../src/modules/product/domain/visibility";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import { createDetailIfNotExists, createSizeIfNotExists, createTagIfNotExists, createTestProduct } from "../../helper";

describe("POST /products/productId/variants", async () => {
  test("create new variant without auth", async () => {
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
    const response = await api
      .post(createVariantsUrlPath)
      .field(createVariantFieldNames.variantData, JSON.stringify(newVariant))
      .attach(createVariantFieldNames.variantImages, absoluteImagePath)
      .attach(createVariantFieldNames.variantImages, absoluteImagePath);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });
});
