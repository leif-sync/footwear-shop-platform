import { expect } from "vitest";
import { api } from "../../api";
import { productsUrlPath, absoluteImagePath } from "../shared";
import { ProductToSend } from "./productBuilder";
import { createProductFieldData } from "../../../src/modules/product/infrastructure/controllers/createProduct";
import { loginTest } from "../../helper";

export async function executeProductValidationTest(params: {
  productData: ProductToSend;
  shouldSucceed: boolean;
}) {
  const cookieToken = await loginTest();
  const imageLocation = absoluteImagePath;
  const productPrimitives = params.productData.toPrimitives();
  const productData = JSON.stringify(productPrimitives);

  const req = api
    .post(productsUrlPath)
    .field(createProductFieldData, productData)
    .set("Cookie", cookieToken);

  productPrimitives.variants.forEach((variant) => {
    variant.imagesAlt.forEach(() => {
      req.attach(variant.imagesField, imageLocation);
    });
  });

  const response = await req;
  expect(response.ok).toBe(params.shouldSucceed);
  if (params.shouldSucceed) {
    expect(response.body).toMatchObject({
      product: {
        productId: expect.any(String),
      },
    });
  }
}
