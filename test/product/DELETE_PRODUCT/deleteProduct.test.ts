import { describe, test, expect } from "vitest";
import { api } from "../../api";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import { productsUrlPath } from "../shared";
import { createTestOrder, createTestProduct, loginTest } from "../../helper";

describe("DELETE /products/:productId", async () => {
  const cookieToken = await loginTest();

  test("delete product without authentication", async () => {
    const { productId: publicProductId } = await createTestProduct();

    const response = await api.delete(`${productsUrlPath}/${publicProductId}`);

    expect(response.ok).equals(false);
    expect(response.status).equals(HTTP_STATUS.UNAUTHORIZED);
  });

  test("delete product with authentication", async () => {
    const { productId: publicProductId } = await createTestProduct();

    const deleteResponse = await api
      .delete(`${productsUrlPath}/${publicProductId}`)
      .set("Cookie", cookieToken);

    expect(deleteResponse.ok).equals(true);

    const getResponse = await api
      .get(`${productsUrlPath}/${publicProductId}`)
      .set("Cookie", cookieToken);

    expect(getResponse.ok).equals(false);
    expect(getResponse.status).equals(HTTP_STATUS.NOT_FOUND);
  });

  test("delete product that was purchased, this should not be allowed", async () => {
    const publicProduct = await createTestProduct();

    const firstVariant = publicProduct.variants[0];
    const sizeValue = firstVariant.sizes[0].sizeValue;
    const variantSizeForShipment = { quantity: 1, sizeValue };
    const orderProductVariant = {
      variantId: firstVariant.variantId,
      variantSizes: [variantSizeForShipment],
    };
    const orderProduct = {
      productId: publicProduct.productId,
      productVariants: [orderProductVariant],
    };

    await createTestOrder({
      orderProducts: [orderProduct],
    });

    const deleteResponse = await api
      .delete(`${productsUrlPath}/${publicProduct.productId}`)
      .set("Cookie", cookieToken);

    expect(deleteResponse.ok).equals(false);
    expect(deleteResponse.status).equals(HTTP_STATUS.CONFLICT);
  });
});
