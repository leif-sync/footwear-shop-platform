/**
 * @file
 * @description
 * Seed script to initialize the database with default values.
 * This script creates an initial super admin user, categories, tags, sizes, details,
 * and a sample product with variants.
 */

import { validPermissionOptions } from "./modules/admin/domain/validPermissions.js";
import {
  productRepository,
  ServiceContainer,
} from "./modules/shared/infrastructure/serviceContainer.js";
import { logger } from "./modules/shared/infrastructure/logger.js";

import { initialSuperAdminUser } from "./environmentVariables.js";
import { ProductFull } from "./modules/product/domain/productFull.js";
import {
  Visibility,
  visibilityOptions,
} from "./modules/product/domain/visibility.js";
import { ProductPrice } from "./modules/product/domain/productPrice.js";
import { PositiveInteger } from "./modules/shared/domain/positiveInteger.js";
import {
  discountOptions,
  DiscountType,
} from "./modules/product/domain/discountType.js";
import { NonNegativeInteger } from "./modules/shared/domain/nonNegativeInteger.js";
import { UUID } from "./modules/shared/domain/UUID.js";
import { VariantFull } from "./modules/product/domain/variantFull.js";
import { VariantSize } from "./modules/product/domain/variantSize.js";
import { HexColor } from "./modules/shared/domain/hexColor.js";
import { VariantDetail } from "./modules/product/domain/variantDetail.js";
import { AppImage } from "./modules/shared/domain/AppImage.js";
import { AppUrl } from "./modules/shared/domain/appUrl.js";
import { VariantTag } from "./modules/product/domain/variantTag.js";
import { CategoryName } from "./modules/category/domain/categoryName.js";

// create initial admin user
ServiceContainer.admin.createAdmin
  .run({
    email: initialSuperAdminUser.email,
    firstName: initialSuperAdminUser.firstName,
    lastName: initialSuperAdminUser.lastName,
    permissions: Object.values(validPermissionOptions),
    phoneNumber: initialSuperAdminUser.phoneNumber,
  })
  .catch((error) => {
    logger.error({
      message: "Error creating initial super admin user",
      error,
    });

    process.exit(1);
  });

// create categories
await ServiceContainer.category.createCategory.run({ categoryName: new CategoryName("Calzado") });
await ServiceContainer.category.createCategory.run({ categoryName: new CategoryName("Mujer") });
await ServiceContainer.category.createCategory.run({ categoryName: new CategoryName("Tacones") });
await ServiceContainer.category.createCategory.run({ categoryName: new CategoryName("Zapatos") });

// create tags
await ServiceContainer.tag.createTag.run({ tagName: "elegante" });
await ServiceContainer.tag.createTag.run({ tagName: "fiesta" });
await ServiceContainer.tag.createTag.run({ tagName: "noche" });
await ServiceContainer.tag.createTag.run({ tagName: "cómodo" });
await ServiceContainer.tag.createTag.run({ tagName: "casual" });
await ServiceContainer.tag.createTag.run({ tagName: "diario" });
await ServiceContainer.tag.createTag.run({ tagName: "brillante" });
await ServiceContainer.tag.createTag.run({ tagName: "glamour" });
await ServiceContainer.tag.createTag.run({ tagName: "evento" });

// create sizes
await ServiceContainer.size.createSize.run({ sizeValue: 36 });
await ServiceContainer.size.createSize.run({ sizeValue: 37 });
await ServiceContainer.size.createSize.run({ sizeValue: 38 });
await ServiceContainer.size.createSize.run({ sizeValue: 39 });
await ServiceContainer.size.createSize.run({ sizeValue: 40 });
await ServiceContainer.size.createSize.run({ sizeValue: 41 });

// create details
await ServiceContainer.detail.createDetail.run({ detailName: "Material" });
await ServiceContainer.detail.createDetail.run({
  detailName: "Altura del tacón",
});

// create initial product
const price = new ProductPrice({
  baseValue: new PositiveInteger(120),
  discountType: new DiscountType(discountOptions.PERCENT),
  discountValue: new NonNegativeInteger(15),
  discountStartAt: new Date("2025-02-18T00:00:00.000Z"),
  discountEndAt: new Date("2025-03-18T00:00:00.000Z"),
});

const size = new VariantSize({
  sizeValue: new PositiveInteger(36),
  stock: new NonNegativeInteger(8),
});

const detail = new VariantDetail({
  content: "Cuero sintético",
  title: "Material",
});

const tags = [
  new VariantTag("elegante"),
  new VariantTag("fiesta"),
  new VariantTag("noche"),
];

const images = [
  new AppImage({
    imageAlt: "image alt",
    imageUrl: new AppUrl("https://example.com/image.jpg"),
  }),
  new AppImage({
    imageAlt: "image alt",
    imageUrl: new AppUrl("https://example.com/image2.jpg"),
  }),
];

const variant = new VariantFull({
  createdAt: new Date(),
  hexColor: new HexColor("#000000"),
  sizes: [size],
  details: [detail],
  tags,
  variantId: UUID.generateRandomUUID(),
  visibility: new Visibility(visibilityOptions.VISIBLE),
  updatedAt: new Date(),
  images,
});

await productRepository.create({
  product: new ProductFull({
    productId: UUID.generateRandomUUID(),
    name: "Zapato de tacón elegante",
    description: "Zapato de tacón alto ideal para eventos formales.",
    categories: ["Calzado", "Mujer", "Tacones"],
    price,
    variants: [variant],
    visibility: new Visibility(visibilityOptions.VISIBLE),
  }),
});
