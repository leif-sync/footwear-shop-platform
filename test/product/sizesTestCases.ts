export const sizesTestCases: {
  createProductTestName: string;
  createVariantTestName: string;
  sizeValue?: number;
  stock?: number;
  shouldSucceed: boolean;
  createSize?: boolean;
}[] = [
  {
    createProductTestName: "create product with valid sizes",
    createVariantTestName: "create variant with valid sizes",
    createSize: true,
    sizeValue: 20,
    shouldSucceed: true,
  },
  {
    createProductTestName: "create product with size < 0",
    createVariantTestName: "create variant with size < 0",
    sizeValue: -1,
    shouldSucceed: false,
  },
  {
    createProductTestName: "create product with size float",
    createVariantTestName: "create variant with size float",
    sizeValue: 1.5,
    shouldSucceed: false,
  },
  {
    createProductTestName: "create product with stock < 0",
    createVariantTestName: "create variant with stock < 0",
    stock: -1,
    shouldSucceed: false,
  },
  {
    createProductTestName: "create product with stock float",
    createVariantTestName: "create variant with stock float",
    stock: 1.5,
    shouldSucceed: false,
  },
];