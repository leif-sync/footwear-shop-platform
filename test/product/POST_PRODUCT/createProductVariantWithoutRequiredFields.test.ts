import { test, expect } from "vitest";
import { ServiceContainer } from "../../../src/modules/shared/infrastructure/serviceContainer";
import { api } from "../../api";
import { productsUrlPath, absoluteImagePath } from "../shared";
import { randomInt } from "node:crypto";
import { ProductToSend } from "./productBuilder";
import { createProductFieldData } from "../../../src/modules/product/infrastructure/controllers/createProduct";
import { loginTest } from "../../helper";

test(`create product variant without required fields`, async () => {
  const cookieToken = await loginTest();
  // * create initial category
  const categoryName = Date.now().toString();
  await ServiceContainer.category.createCategory.run({ categoryName });

  // * create initial tags
  const tagName = Date.now().toString();
  await ServiceContainer.tag.createTag.run({ tagName });

  // * create initial detail
  const detailName = Date.now().toString();
  await ServiceContainer.detail.createDetail.run({ detailName });

  // * create initial size
  const sizeValue = randomInt(1, 100000);
  await ServiceContainer.size.createSize.run({ sizeValue });

  const imageField = "images1";

  const product = new ProductToSend({
    variants: [
      {
        imagesAlt: [Date.now().toString(), Date.now().toString()],
        imagesField: imageField,
        tags: [tagName],
        details: [
          {
            title: detailName,
            content: Date.now().toString(),
          },
        ],
        sizes: [
          {
            sizeValue,
            stock: 1,
          },
        ],
      },
    ],
    productCategories: [categoryName],
  }).toPrimitives();

  for (const key in product.variants[0]) {
    const variantData = {
      ...product.variants[0],
      [key]: undefined,
    };

    product.variants = [variantData];

    const response = await api
      .post(productsUrlPath)
      .field(createProductFieldData, JSON.stringify(product))
      .attach(imageField, absoluteImagePath)
      .attach(imageField, absoluteImagePath)
      .set("Cookie", cookieToken);

    expect(response.ok).toBe(false);
  }
});
