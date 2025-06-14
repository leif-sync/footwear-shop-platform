export type partialProductDetailsDto = {
  productId: string;
  unitPrice: number;
  variants: {
    variantId: string;
    sizes: {
      sizeValue: number;
      stock: number;
    }[];
  }[];
};
