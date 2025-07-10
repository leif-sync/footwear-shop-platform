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
} from "./modules/shared/infrastructure/setupDependencies.js";
import { logger } from "./modules/shared/infrastructure/setupDependencies.js";

import { initialSuperAdminUser, isAppTest } from "./environmentVariables.js";
import { ProductFull } from "./modules/product/domain/productFull.js";
import {
  Visibility,
  visibilityOptions,
} from "./modules/product/domain/visibility.js";
import { ProductPrice } from "./modules/product/domain/productPrice.js";
import { PositiveInteger } from "./modules/shared/domain/positiveInteger.js";
import {
  DiscountOptions,
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
import { DetailTitle } from "./modules/detail/domain/detailTitle.js";
import { DetailAlreadyExistsError } from "./modules/detail/domain/detailAlreadyExistsError.js";
import { SizeAlreadyExistsError } from "./modules/size/domain/errors/sizeAlreadyExistsError.js";
import { TagAlreadyExistsError } from "./modules/tag/domain/errors/tagAlreadyExistsError.js";
import { CategoryAlreadyExistsError } from "./modules/category/domain/errors/categoryAlreadyExistsError.js";
import { AdminAlreadyExistsError } from "./modules/admin/domain/errors/adminAlreadyExistsError.js";

export async function seedDatabase() {
  await seedCategories();
  await seedTags();
  await seedSizes();
  await seedDetails();
  await seedInitialProduct();
  await createInitialSuperAdmin();
  if (!isAppTest) {
    logger.info({
      message: "Database seeded successfully",
    });
  }
}

export async function createInitialSuperAdmin() {
  try {
    await ServiceContainer.admin.createAdmin.run({
      email: initialSuperAdminUser.email,
      firstName: initialSuperAdminUser.firstName,
      lastName: initialSuperAdminUser.lastName,
      permissions: Object.values(validPermissionOptions),
      phoneNumber: initialSuperAdminUser.phoneNumber,
    });
  } catch (error) {
    if (error instanceof AdminAlreadyExistsError || isAppTest) {
      if (isAppTest) return;
      logger.warn({
        message: `Admin with email "${initialSuperAdminUser.email}" already exists, skipping...`,
      });
      return;
    }

    logger.error({
      message: "Error creating initial super admin user",
      error,
    });

    process.exit(1);
  }
}

export async function seedInitialProduct() {
  const sizeToCreate = 36;
  await seedSizes([sizeToCreate]);
  const detailToCreate = "Material";
  await seedDetails([detailToCreate]);
  const tagsToCreate = ["elegante", "fiesta", "noche"];
  await seedTags(tagsToCreate);
  const categoriesToCreate = ["Calzado", "Mujer", "Tacones"];
  await seedCategories(categoriesToCreate);

  const price = new ProductPrice({
    baseValue: new PositiveInteger(120),
    discountType: new DiscountType(DiscountOptions.PERCENT),
    discountValue: new NonNegativeInteger(15),
    discountStartAt: new Date("2025-02-18T00:00:00.000Z"),
    discountEndAt: new Date("2025-03-18T00:00:00.000Z"),
  });

  const size = new VariantSize({
    sizeValue: new PositiveInteger(sizeToCreate),
    stock: new NonNegativeInteger(8),
  });

  const detail = new VariantDetail({
    content: "Cuero sintético",
    title: detailToCreate,
  });

  const tags = tagsToCreate.map((tagName) => new VariantTag(tagName));

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

  try {
    await productRepository.create({
      product: new ProductFull({
        productId: UUID.generateRandomUUID(),
        name: "Zapato de tacón elegante",
        description: "Zapato de tacón alto ideal para eventos formales.",
        categories: categoriesToCreate,
        price,
        variants: [variant],
        visibility: new Visibility(visibilityOptions.VISIBLE),
      }),
    });
  } catch (error) {
    logger.error({
      message: "Error creating initial product",
      error,
    });

    throw error;
  }
}

export async function seedDetails(details?: string[]) {
  const detailTitles = details ?? ["Material", "Altura del tacón"];

  for (const title of detailTitles) {
    try {
      await ServiceContainer.detail.createDetail.run({
        detailTitle: new DetailTitle(title),
      });
    } catch (error) {
      if (error instanceof DetailAlreadyExistsError) {
        if (isAppTest) return;
        logger.warn({
          message: `Detail with title "${title}" already exists, skipping...`,
        });
        return;
      }

      throw error;
    }
  }
}

export async function seedSizes(sizes?: number[]) {
  const sizeValues = sizes ?? [34, 35, 36, 37, 38, 39, 40, 41];

  for (const sizeValue of sizeValues) {
    try {
      await ServiceContainer.size.createSize.run({ sizeValue });
    } catch (error) {
      if (error instanceof SizeAlreadyExistsError) {
        if (isAppTest) return;
        logger.warn({
          message: `Size ${sizeValue} already exists, skipping...`,
        });

        return;
      }

      throw error;
    }
  }
}

export async function seedTags(tags?: string[]) {
  const tagNames = tags ?? [
    "elegante",
    "fiesta",
    "noche",
    "cómodo",
    "casual",
    "diario",
    "brillante",
    "glamour",
    "evento",
  ];

  for (const tagName of tagNames) {
    try {
      await ServiceContainer.tag.createTag.run({ tagName });
    } catch (error) {
      if (error instanceof TagAlreadyExistsError) {
        if (isAppTest) return;
        logger.warn({
          message: `Tag "${tagName}" already exists, skipping...`,
        });

        return;
      }

      throw error;
    }
  }
}

export async function seedCategories(categories?: string[]) {
  const categoryNames = categories ?? [
    "Calzado",
    "Mujer",
    "Tacones",
    "Zapatos",
  ];

  for (const categoryName of categoryNames) {
    try {
      await ServiceContainer.category.createCategory.run({
        categoryName: new CategoryName(categoryName),
      });
    } catch (error) {
      if (error instanceof CategoryAlreadyExistsError) {
        if (isAppTest) return;
        logger.warn({
          message: `Category "${categoryName}" already exists, skipping...`,
        });
        return;
      }

      throw error;
    }
  }
}
