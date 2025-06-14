import { test, expect } from "vitest";
import { api } from "../../api";
import { productsUrlPath } from "../shared";
import { priceTestCases } from "../priceTestCases";
import { createTestProduct, loginTest } from "../../helper";

priceTestCases.forEach((price) => {
  handleUpdatePartialProductPrice({
    baseValue: price.baseValue,
    discountValue: price.discountValue,
    discountType: price.discountType,
    discountStartAt: price.discountStartAt,
    discountEndAt: price.discountEndAt,
    shouldSucceed: price.shouldSucceed,
    testName: price.updateTestName,
  });
});

async function handleUpdatePartialProductPrice(params: {
  testName: string;
  baseValue: number;
  discountValue: number;
  discountType: string;
  discountStartAt: string | null;
  discountEndAt: string | null;
  shouldSucceed: boolean;
}) {
  test(params.testName, async () => {
    const cookieToken = await loginTest();

    const {
      baseValue,
      discountValue,
      discountType,
      shouldSucceed,
      discountEndAt,
      discountStartAt,
    } = params;

    const { productId: publicProductId } = await createTestProduct();

    const updatedProductData = {
      price: {
        baseValue,
        discountValue,
        discountType,
        discountStartAt,
        discountEndAt,
      },
    };

    const response = await api
      .patch(`${productsUrlPath}/${publicProductId}`)
      .set("Cookie", cookieToken)
      .send(updatedProductData);

    expect(response.ok).equals(shouldSucceed);
  });
}
