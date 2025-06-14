import { describe, test, expect } from "vitest";
import { api } from "../../api";
import { absoluteImagePath } from "../shared";
import { productsUrlPath } from "../shared";
import { createVariantFieldNames } from "../../../src/modules/product/infrastructure/controllers/createVariant";
import { createUniqueVariantSchemaType } from "../../../src/modules/product/infrastructure/schemas/variant";
import { visibilityOptions } from "../../../src/modules/product/domain/visibility";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import {
  createDetailIfNotExists,
  createSizeIfNotExists,
  createTagIfNotExists,
  createTestProduct,
  loginTest,
} from "../../helper";

describe("POST /products/productId/variants", async () => {
  const cookieToken = await loginTest();
  test("create a new valid hidden variant", async () => {
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
      visibility: visibilityOptions.HIDDEN,
    };

    const responsePost = await api
      .post(createVariantsUrlPath)
      .field(createVariantFieldNames.variantData, JSON.stringify(newVariant))
      .attach(createVariantFieldNames.variantImages, absoluteImagePath)
      .attach(createVariantFieldNames.variantImages, absoluteImagePath)
      .set("Cookie", cookieToken);

    expect(responsePost.ok).toBe(true);
    expect(responsePost.status).toBe(HTTP_STATUS.CREATED);
    expect(responsePost.body).toMatchObject({
      variant: {
        variantId: expect.any(String),
      },
    });

    const responseGetWithoutAuth = await api.get(
      `${productsUrlPath}/${productId}`
    );
    expect(responseGetWithoutAuth.ok).toBe(true);
    expect(responseGetWithoutAuth.body.product).toMatchObject({
      variants: expect.any(Array),
    });

    responseGetWithoutAuth.body.product.variants.forEach((variant) => {
      expect(variant.variantId).not.equals(responsePost.body.variant.variantId);
    });

    const responseGetWithAuth = await api
      .get(`${productsUrlPath}/${productId}`)
      .set("Cookie", cookieToken);
    expect(responseGetWithAuth.ok).toBe(true);
    expect(responseGetWithAuth.body.product).toMatchObject({
      variants: expect.any(Array),
    });

    let isVariantPresent = false;

    responseGetWithAuth.body.product.variants.forEach((variant) => {
      if (variant.variantId === responsePost.body.variant.variantId) {
        isVariantPresent = true;
      }
    });

    expect(isVariantPresent).toBe(true);
  });
});
