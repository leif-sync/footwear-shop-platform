import { DiscountOptions } from "../../src/modules/product/domain/discountType";

export const priceTestCases: {
  updateTestName: string;
  createTestName: string;
  baseValue: number;
  discountValue: number;
  discountType: string;
  discountStartAt: string | null;
  discountEndAt: string | null;
  shouldSucceed: boolean;
}[] = [
  {
    updateTestName: "update product with valid price",
    createTestName: "create product with valid price",
    baseValue: 100,
    discountValue: 10,
    discountType: DiscountOptions.PERCENT,
    discountStartAt: new Date().toISOString(),
    discountEndAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    shouldSucceed: true,
  },
  {
    updateTestName: "update product with price baseValue < discountValue FIXED",
    createTestName: "create product with price baseValue < discountValue FIXED",
    baseValue: 100,
    discountValue: 200,
    discountType: DiscountOptions.FIXED,
    shouldSucceed: false,
    discountEndAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    discountStartAt: new Date().toISOString(),
  },
  {
    updateTestName: "update product with price discountValue > 100 PERCENT",
    createTestName: "create product with price discountValue > 100 PERCENT",
    discountType: DiscountOptions.PERCENT,
    discountValue: 200,
    shouldSucceed: false,
    baseValue: 100,
    discountEndAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    discountStartAt: new Date().toISOString(),
  },
  {
    updateTestName: "update product with price discountStartAt > discountEndAT",
    createTestName: "create product with price discountStartAt > discountEndAT",
    discountStartAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    discountEndAt: new Date().toISOString(),
    shouldSucceed: false,
    baseValue: 100,
    discountValue: 10,
    discountType: DiscountOptions.PERCENT,
  },
  {
    updateTestName: "update product with invalid discount type",
    createTestName: "create product with invalid discount type",
    discountType: "INVALID_DISCOUNT_TYPE",
    shouldSucceed: false,
    baseValue: 100,
    discountValue: 10,
    discountEndAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    discountStartAt: new Date().toISOString(),
  },

  {
    updateTestName: "update product with discount without dates",
    createTestName: "create product with discount without dates",
    discountType: DiscountOptions.FIXED,
    discountStartAt: null,
    discountEndAt: null,
    shouldSucceed: false,
    baseValue: 100,
    discountValue: 10,
  },
  {
    updateTestName: "update product with discount without start date",
    createTestName: "create product with discount without start date",
    discountType: DiscountOptions.FIXED,
    discountStartAt: null,
    discountEndAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    shouldSucceed: false,
    baseValue: 100,
    discountValue: 10,
  },
  {
    updateTestName: "update product with discount without end date",
    createTestName: "create product with discount without end date",
    discountType: DiscountOptions.FIXED,
    discountStartAt: new Date().toISOString(),
    discountEndAt: null,
    shouldSucceed: false,
    baseValue: 100,
    discountValue: 10,
  },
  {
    updateTestName: "update product with valid discount NONE",
    createTestName: "create product with valid discount NONE",
    discountType: DiscountOptions.NONE,
    discountValue: 0,
    discountStartAt: null,
    discountEndAt: null,
    shouldSucceed: true,
    baseValue: 100,
  },
  {
    updateTestName: "update product with discount NONE and dates",
    createTestName: "create product with discount NONE and dates",
    discountType: DiscountOptions.NONE,
    discountValue: 0,
    discountStartAt: new Date().toISOString(),
    discountEndAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    shouldSucceed: false,
    baseValue: 100,
  },
  {
    updateTestName: "update product with discount NONE and discountValue > 0",
    createTestName: "create product with discount NONE and discountValue > 0",
    discountType: DiscountOptions.NONE,
    discountValue: 10,
    discountStartAt: null,
    discountEndAt: null,
    shouldSucceed: false,
    baseValue: 100,
  },
];
