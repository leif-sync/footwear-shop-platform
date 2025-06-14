import { test, expect } from "vitest";
import { createTestOrder, loginTest } from "../../helper.ts";
import { api } from "../../api.ts";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus.ts";
import { ordersPathUrl } from "../shared.ts";
import { orderStatusOptions } from "../../../src/modules/order/domain/orderStatus.ts";
import { orderPaymentStatusOptions } from "../../../src/modules/order/domain/orderPaymentStatus.ts";
import { CountryData } from "../../../src/modules/order/domain/countryData.ts";

test("get order by id", async () => {
  const token = await loginTest();
  const order = await createTestOrder();

  const response = await api
    .get(`${ordersPathUrl}/${order.orderId}`)
    .set("Cookie", token);

  expect(response.status).toBe(HTTP_STATUS.OK);
  expect(response.body.order).toBeDefined();
  expect(response.body.order).toMatchObject({
    orderId: expect.any(String),
    status: expect.toBeOneOf(Object.keys(orderStatusOptions)),
    customer: {
      firstName: expect.any(String),
      lastName: expect.any(String),
      email: expect.any(String),
      phone: expect.any(String),
    },
    shippingAddress: {
      region: expect.any(String),
      commune: expect.any(String),
      streetName: expect.any(String),
      streetNumber: expect.any(String),
      additionalInfo: expect.any(String),
    },
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
    products: [
      {
        productId: expect.any(String),
        productName: expect.any(String),
        unitPrice: expect.any(Number),
        productVariants: expect.any(Array),
      },
    ],
    paymentInfo: {
      paymentStatus: expect.toBeOneOf(Object.keys(orderPaymentStatusOptions)),
      paymentDeadline: expect.any(String),
      paymentAt: expect.toBeOneOf([null, expect.any(String)]),
    },
    creatorDetails: { creator: expect.any(String) },
  });

  const regionFromResponse = response.body.order.shippingAddress.region;
  const communeFromResponse = response.body.order.shippingAddress.commune;
  const expectedCommune = CountryData.regions
    .find((region) => region.name === regionFromResponse)
    ?.communes.find((commune) => commune === communeFromResponse);
  expect(expectedCommune).toBeDefined();
  expect(regionFromResponse).toBeOneOf(
    CountryData.regions.map((region) => region.name)
  );
  expect(communeFromResponse).equal(expectedCommune);
  response.body.order.products.forEach((product) => {
    product.productVariants.forEach((variant) => {
      expect(variant.variantId).toBeOneOf([expect.any(String)]);
      variant.variantSizes.forEach((size) => {
        expect(size.sizeValue).toEqual(expect.any(Number));
        expect(size.quantity).toEqual(expect.any(Number));});
    });
  });
});
