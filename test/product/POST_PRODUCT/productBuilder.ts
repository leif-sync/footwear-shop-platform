import { discountOptions } from "../../../src/modules/product/domain/discountType";
import { visibilityOptions } from "../../../src/modules/product/domain/visibility";
import type { MakeOptional } from "../../../src/modules/shared/domain/helperTypes";

type priceToSend = {
  baseValue: number;
  discountType: string;
  discountValue: number;
  discountStartAt: string | null;
  discountEndAt: string | null;
};

const defaultPrice: priceToSend = {
  baseValue: 120,
  discountType: discountOptions.PERCENT as string,
  discountValue: 15,
  discountStartAt: "2025-02-18T00:00:00.000Z",
  discountEndAt: "2025-03-18T00:00:00.000Z",
};

type detailToSend = {
  title: string;
  content: string;
};

type sizeToSend = {
  sizeValue: number;
  stock: number;
};

type variantToSend = {
  sizes: sizeToSend[];
  details: detailToSend[];
  tags: string[];
  hexColor: string;
  imagesField: string;
  imagesAlt: [string, string, ...string[]];
  visibility: string;
};

const defaultVariant: variantToSend = {
  sizes: [
    {
      sizeValue: 36,
      stock: 8,
    },
  ],
  details: [
    {
      title: "Altura del tacón",
      content: "10 cm",
    },
  ],
  tags: ["elegante"],
  hexColor: "#000000",
  imagesField: "imagesOfVariant1",
  imagesAlt: ["zapato negro", "tacón alto"],
  visibility: visibilityOptions.VISIBLE,
};

type productToSend = {
  productName: string;
  productDescription: string;
  productCategories: string[];
  visibility: string;
  price: priceToSend;
  variants: variantToSend[];
};

const defaultProductData: productToSend = {
  productName: "Zapato de tacón elegante",
  productDescription: "Zapato de tacón alto ideal para eventos formales.",
  productCategories: ["Calzado", "Mujer", "Tacones"],
  price: defaultPrice,
  visibility: visibilityOptions.VISIBLE as string,
  variants: [defaultVariant],
};

type constructVariant = Partial<Omit<variantToSend, "sizes" | "details">> & {
  sizes: MakeOptional<sizeToSend, "stock">[];
  details: MakeOptional<detailToSend, "content">[];
};

type constructProduct = Partial<
  Omit<productToSend, "variants" | "price" | "productCategories">
> & {
  variants: [constructVariant, ...constructVariant[]];
  price?: Partial<priceToSend>;
  productCategories: string[];
};

export class ProductToSend {
  product: typeof defaultProductData;

  constructor(newData?: constructProduct) {
    const validVariants: variantToSend[] = !newData?.variants
      ? [defaultVariant]
      : newData?.variants.map((v) => {
          const variantSizes = v.sizes
            ? v.sizes.map((s) => ({
                sizeValue: s.sizeValue ?? defaultVariant.sizes[0].sizeValue,
                stock: s.stock ?? defaultVariant.sizes[0].stock,
              }))
            : defaultVariant.sizes;

          const variantDetails = v.details
            ? v.details.map((d) => ({
                title: d.title ?? defaultVariant.details[0].title,
                content: d.content ?? defaultVariant.details[0].content,
              }))
            : defaultVariant.details;

          return {
            imagesField: v.imagesField ?? defaultVariant.imagesField,
            imagesAlt: v.imagesAlt ?? defaultVariant.imagesAlt,
            visibility: v.visibility ?? defaultVariant.visibility,
            tags: v.tags ?? defaultVariant.tags,
            sizes: variantSizes,
            details: variantDetails,
            hexColor: v.hexColor ?? defaultVariant.hexColor,
          };
        });

    const productCategoriesToUse =
      newData?.productCategories ?? defaultProductData.productCategories;

    const productDescriptionToUse =
      newData?.productDescription ?? defaultProductData.productDescription;

    const productNameToUse =
      newData?.productName ?? defaultProductData.productName;

    const productVisibility =
      newData?.visibility ?? defaultProductData.visibility;

    const basePriceValue =
      newData?.price?.baseValue ?? defaultProductData.price.baseValue;

    const discountTypeValue =
      newData?.price?.discountType ?? defaultProductData.price.discountType;

    const discountValueToApply =
      newData?.price?.discountValue ?? defaultProductData.price.discountValue;

    const discountStartDate =
      newData?.price?.discountStartAt ||
      newData?.price?.discountStartAt === null
        ? newData?.price.discountStartAt
        : defaultProductData.price.discountStartAt;

    const discountEndDate =
      newData?.price?.discountEndAt || newData?.price?.discountEndAt === null
        ? newData?.price.discountEndAt
        : defaultProductData.price.discountEndAt;

    const updatedPrice = {
      baseValue: basePriceValue,
      discountType: discountTypeValue,
      discountValue: discountValueToApply,
      discountStartAt: discountStartDate,
      discountEndAt: discountEndDate,
    };

    this.product = {
      productCategories: productCategoriesToUse,
      productDescription: productDescriptionToUse,
      productName: productNameToUse,
      visibility: productVisibility,
      variants: validVariants,
      price: updatedPrice,
    };
  }

  toPrimitives() {
    return this.product;
  }

  // setProductName(name: string) {
  //   this.product.productName = name;
  //   return this;
  // }
  // setProductDescription(description: string) {
  //   this.product.productDescription = description;
  //   return this;
  // }
  // setProductCategories(categories: string[]) {
  //   this.product.productCategories = categories;
  //   return this;
  // }
  // setProductVisibility(visibility: string) {
  //   this.product.visibility = visibility;
  //   return this;
  // }
  // modifyPrice(price: Partial<priceToSend>) {
  //   this.product.price = {
  //     ...this.product.price,
  //     ...price,
  //   };
  //   return this;
  // }
  // firstVariant = {
  //   setTags: (tags: string[]) => {
  //     this.product.variants[0].tags = tags;
  //     return this;
  //   },
  //   setHexColor: (hexColor: string) => {
  //     this.product.variants[0].hexColor = hexColor;
  //     return this;
  //   },
  //   setImagesField: (imagesField: string) => {
  //     this.product.variants[0].imagesField = imagesField;
  //     return this;
  //   },
  //   setImagesAlt: (imagesAlt: [string, string, ...string[]]) => {
  //     this.product.variants[0].imagesAlt = imagesAlt;
  //     return this;
  //   },
  //   setVisibility: (visibility: string) => {
  //     this.product.variants[0].visibility = visibility;
  //     return this;
  //   },
  //   setSizes: (sizes: { sizeValue?: number; stock?: number }[]) => {
  //     this.product.variants[0].sizes = sizes.map((s) => ({
  //       sizeValue: s.sizeValue ?? defaultVariant.sizes[0].sizeValue,
  //       stock: s.stock ?? defaultVariant.sizes[0].stock,
  //     }));
  //     return this;
  //   },
  //   setDetails: (details: { title?: string; content?: string }[]) => {
  //     this.product.variants[0].details = details.map((d) => ({
  //       title: d.title ?? defaultVariant.details[0].title,
  //       content: d.content ?? defaultVariant.details[0].content,
  //     }));
  //     return this;
  //   },
  // };
}
