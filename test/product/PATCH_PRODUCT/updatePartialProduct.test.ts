import { describe, test, expect } from "vitest";
import { api } from "../../api";
import { productsUrlPath } from "../shared";
import { visibilityOptions } from "../../../src/modules/product/domain/visibility";
import { DiscountOptions } from "../../../src/modules/product/domain/discountType";
import {
  adminProductFullSchema,
  publicProductFullSchema,
} from "../GET_UNIQUE/productFullSchema";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import {
  createTestProduct,
  createCategoryIfNotExists,
  loginTest,
} from "../../helper";

describe("PATCH /products/:productId", async () => {
  const cookieToken = await loginTest();
  test("update partial product without authentication", async () => {
    const { productId: publicProductId } = await createTestProduct();

    const updatedProductData = {
      productName: "Updated Product Name",
      productDescription: "Updated Product Description",
      visibility: visibilityOptions.VISIBLE,
    };

    const response = await api
      .patch(`${productsUrlPath}/${publicProductId}`)
      .send(updatedProductData);

    expect(response.ok).equals(false);
    expect(response.status).equals(HTTP_STATUS.UNAUTHORIZED);
  });

  test(`update partial product with valid data`, async () => {
    const { productId: publicProductId } = await createTestProduct();

    const newCategory = Date.now().toString();
    await createCategoryIfNotExists(newCategory);

    const updatedProductData = {
      productName: "Updated Product Name",
      productDescription: "Updated Product Description",
      visibility: visibilityOptions.VISIBLE,
      productCategories: [newCategory],
      price: {
        baseValue: 100,
        discountType: DiscountOptions.FIXED,
        discountValue: 80,
        discountStartAt: new Date(),
        discountEndAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    };

    const response = await api
      .patch(`${productsUrlPath}/${publicProductId}`)
      .set("Cookie", cookieToken)
      .send(updatedProductData);

    expect(response.ok).equals(true);

    const productResponse = await api.get(
      `${productsUrlPath}/${publicProductId}`
    );
    expect(productResponse.ok).equals(true);

    const { body } = productResponse;
    const product = publicProductFullSchema.parse(body.product);
    expect(product).toMatchObject({
      productId: publicProductId,
      name: updatedProductData.productName,
      description: updatedProductData.productDescription,
      categories: [newCategory],
      visibility: updatedProductData.visibility,
      price: {
        baseValue: updatedProductData.price.baseValue,
        discountType: updatedProductData.price.discountType,
        discountValue: updatedProductData.price.discountValue,
        discountStartAt: expect.any(Date),
        discountEndAt: expect.any(Date),
      },
    });
  });

  test("update partial product visibility to hidden", async () => {
    const { productId: publicProductId } = await createTestProduct();

    const updatedProductData = {
      visibility: visibilityOptions.HIDDEN,
    };

    const response = await api
      .patch(`${productsUrlPath}/${publicProductId}`)
      .set("Cookie", cookieToken)
      .send(updatedProductData);

    expect(response.ok).equals(true);

    const getProductWithoutAuthResponse = await api.get(
      `${productsUrlPath}/${publicProductId}`
    );
    expect(getProductWithoutAuthResponse.ok).equals(false);

    const getProductWithAuthResponse = await api
      .get(`${productsUrlPath}/${publicProductId}`)
      .set("Cookie", cookieToken);
    expect(getProductWithAuthResponse.ok).equals(true);

    const product = adminProductFullSchema.parse(
      getProductWithAuthResponse.body.product
    );

    expect(product).toMatchObject({
      productId: publicProductId,
      visibility: updatedProductData.visibility,
    });
  });

  test("update partial product with invalid category", async () => {
    const { productId: publicProductId } = await createTestProduct();

    const updatedProductData = {
      productCategories: ["INVALID_CATEGORY"],
    };

    const response = await api
      .patch(`${productsUrlPath}/${publicProductId}`)
      .set("Cookie", cookieToken)
      .send(updatedProductData);

    expect(response.ok).equals(false);
    expect(response.status).equals(HTTP_STATUS.BAD_REQUEST);
  });
});
