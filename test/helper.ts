/**
 * @file Helper functions for testing
 * @description This file contains utility functions to create test data such as products, orders, and login tokens.
 * @module test/helper
 */

import { CategoryAlreadyExistsError } from "../src/modules/category/domain/errors/categoryAlreadyExistsError";
import {
  DiscountType,
  discountOptions,
} from "../src/modules/product/domain/discountType";
import { ProductFull } from "../src/modules/product/domain/productFull";
import { ProductPrice } from "../src/modules/product/domain/productPrice";
import { VariantDetail } from "../src/modules/product/domain/variantDetail";
import { VariantFull } from "../src/modules/product/domain/variantFull";
import { VariantSize } from "../src/modules/product/domain/variantSize";
import { VariantTag } from "../src/modules/product/domain/variantTag";
import {
  visibilityOptions,
  Visibility,
} from "../src/modules/product/domain/visibility";
import { AppUrl } from "../src/modules/shared/domain/appUrl";
import { HexColor } from "../src/modules/shared/domain/hexColor";
import { NonNegativeInteger } from "../src/modules/shared/domain/nonNegativeInteger";
import { PositiveInteger } from "../src/modules/shared/domain/positiveInteger";
import { UUID } from "../src/modules/shared/domain/UUID";
import {
  productRepository,
  ServiceContainer,
} from "../src/modules/shared/infrastructure/serviceContainer";
import { SizeAlreadyExistsError } from "../src/modules/size/domain/errors/sizeAlreadyExistsError";
import { TagAlreadyExistsError } from "../src/modules/tag/domain/errors/tagAlreadyExistsError";
import { AppImage } from "../src/modules/shared/domain/AppImage";
import { DetailAlreadyExistsError } from "../src/modules/detail/domain/detailAlreadyExistsError";
import {
  initialSuperAdminUser,
  ACCESS_TOKEN_JWT_EXPIRES_SECONDS,
  JWT_SECRET,
} from "../src/environmentVariables";
import jwt from "jsonwebtoken";
import {
  adminAccessTokenName,
  adminAccessTokenPayload,
} from "../src/modules/auth/infrastructure/controllers/loginAdmin";
import {
  OrderStatus,
  OrderStatusOptions,
} from "../src/modules/order/domain/orderStatus";
import { CountryData } from "../src/modules/order/domain/countryData";
import {
  OrderPaymentStatus,
  OrderPaymentStatusOptions,
} from "../src/modules/order/domain/orderPaymentStatus";
import { Email } from "../src/modules/shared/domain/email";
import { Phone } from "../src/modules/shared/domain/phone";
import { Customer } from "../src/modules/order/domain/customer";
import { ShippingAddress } from "../src/modules/order/domain/shippingAddress";
import { OrderVariantWrite } from "../src/modules/order/domain/orderVariantWrite";
import { OrderVariantSize } from "../src/modules/order/domain/orderVariantSize";
import { OrderCreatorDetails } from "../src/modules/order/domain/orderCreatorDetails";
import { OrderCreator } from "../src/modules/order/domain/orderCreator";
import { OrderPaymentInfo } from "../src/modules/order/domain/orderPaymentInfo";
import { OrderItem } from "../src/modules/order/domain/setupOrderInformation";
import { CustomerFirstName } from "../src/modules/order/domain/customerFirstName";
import { CustomerLastName } from "../src/modules/order/domain/customerLastName";
import { CategoryName } from "../src/modules/category/domain/categoryName";
import { DetailTitle } from "../src/modules/detail/domain/detailTitle";

export async function loginTest() {
  const adminEmail = initialSuperAdminUser.email;
  const admin = await ServiceContainer.admin.getAdmin.run({ adminEmail });
  const adminPrimitives = admin.toPrimitives();

  const token = jwt.sign(
    {
      adminId: adminPrimitives.adminId,
      permissions: adminPrimitives.permissions,
    } as adminAccessTokenPayload,
    JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_JWT_EXPIRES_SECONDS,
    }
  );

  return `${adminAccessTokenName}=${token}`;
}

export async function createTestProduct(params?: {
  productVisibility?: visibilityOptions;
  categories?: string[];
  variants?: [
    {
      visibility?: visibilityOptions.VISIBLE;
      tags?: string[];
      sizes?: {
        sizeValue?: number;
        stock?: number;
      }[];
      details?: {
        title?: string;
        content?: string;
      }[];
    },
    ...{
      visibility?: visibilityOptions;
      tags?: string[];
      sizes?: {
        sizeValue?: number;
        stock?: number;
      }[];
      details?: {
        title?: string;
        content?: string;
      }[];
    }[],
  ];
}) {
  const price = new ProductPrice({
    baseValue: new PositiveInteger(120),
    discountType: new DiscountType(discountOptions.PERCENT),
    discountValue: new NonNegativeInteger(15),
    discountStartAt: new Date(),
    discountEndAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30),
  });

  const newSize = 36;
  await createSizeIfNotExists(newSize);

  const newDetail = Math.random().toString();
  await createDetailIfNotExists(newDetail);

  const newTag = Math.random().toString();
  await createTagIfNotExists(newTag);

  const variantsPromises = params?.variants?.map(async (variant) => {
    const sizes = variant.sizes?.map((size) => {
      return new VariantSize({
        sizeValue: new PositiveInteger(size.sizeValue ?? newSize),
        stock: new NonNegativeInteger(size.stock ?? 8),
      });
    }) ?? [
      new VariantSize({
        sizeValue: new PositiveInteger(newSize),
        stock: new NonNegativeInteger(8),
      }),
    ];

    for (const size of sizes) {
      const sizeValue = size.getSizeValue();
      await ServiceContainer.size.getSize.run({ sizeValue });
    }

    const details = variant.details?.map((detail) => {
      return new VariantDetail({
        content: detail.content ?? Date.now().toString(),
        title: detail.title ?? newDetail,
      });
    }) ?? [
      new VariantDetail({
        content: Date.now().toString(),
        title: newDetail,
      }),
    ];

    for (const detail of details) {
      const detailTitle = new DetailTitle(detail.getTitle());
      await ServiceContainer.detail.getDetail.run({ detailTitle });
    }
    const tags = variant.tags?.map((tag) => {
      return new VariantTag(tag);
    }) ?? [new VariantTag(newTag)];

    for (const tag of tags) {
      const tagName = tag.getValue();
      await ServiceContainer.tag.getTag.run({ tagName });
    }

    const images = [
      new AppImage({
        imageAlt: Date.now().toString(),
        imageUrl: new AppUrl("https://example.com/image.jpg"),
      }),
      new AppImage({
        imageAlt: Date.now().toString(),
        imageUrl: new AppUrl("https://example.com/image2.jpg"),
      }),
    ];

    return new VariantFull({
      variantId: UUID.generateRandomUUID(),
      createdAt: new Date(),
      hexColor: new HexColor("#000000"),
      sizes,
      details,
      tags,
      visibility: new Visibility(
        variant.visibility ?? visibilityOptions.VISIBLE
      ),
      updatedAt: new Date(),
      images,
    });
  }) ?? [
    new VariantFull({
      variantId: UUID.generateRandomUUID(),
      createdAt: new Date(),
      hexColor: new HexColor("#000000"),
      sizes: [
        new VariantSize({
          sizeValue: new PositiveInteger(newSize),
          stock: new NonNegativeInteger(8),
        }),
      ],
      details: [
        new VariantDetail({
          content: Date.now().toString(),
          title: newDetail,
        }),
      ],
      tags: [new VariantTag(newTag)],
      visibility: new Visibility(visibilityOptions.VISIBLE),
      updatedAt: new Date(),
      images: [
        new AppImage({
          imageAlt: Date.now().toString(),
          imageUrl: new AppUrl("https://example.com/image.jpg"),
        }),
        new AppImage({
          imageAlt: Date.now().toString(),
          imageUrl: new AppUrl("https://example.com/image2.jpg"),
        }),
      ],
    }),
  ];

  const variants = await Promise.all(variantsPromises);

  const productId = UUID.generateRandomUUID();

  const newCategory = Math.random().toString();
  await createCategoryIfNotExists(newCategory);
  const categories = params?.categories ?? [newCategory];

  for (const name of categories) {
    const categoryName = new CategoryName(name);
    await ServiceContainer.category.getCategory.run({ categoryName });
  }

  const product = new ProductFull({
    productId,
    name: Date.now().toString(),
    description: Date.now().toString(),
    categories,
    price,
    variants,
    visibility: new Visibility(
      params?.productVisibility ?? visibilityOptions.VISIBLE
    ),
  });

  await productRepository.create({ product });

  return {
    ...product.toPrimitives(),
  };
}

export async function createSizeIfNotExists(sizeValue: number) {
  try {
    return await ServiceContainer.size.createSize.run({ sizeValue });
  } catch (error) {
    if (error instanceof SizeAlreadyExistsError) {
      return await ServiceContainer.size.getSize.run({
        sizeValue,
      });
    }
    throw error;
  }
}

export async function createCategoryIfNotExists(name: string) {
  const categoryName = new CategoryName(name);

  try {
    return await ServiceContainer.category.createCategory.run({
      categoryName,
    });
  } catch (error) {
    if (error instanceof CategoryAlreadyExistsError) {
      return await ServiceContainer.category.getCategory.run({
        categoryName,
      });
    }

    throw error;
  }
}

export async function createTagIfNotExists(tagName: string) {
  try {
    return await ServiceContainer.tag.createTag.run({ tagName });
  } catch (error) {
    if (error instanceof TagAlreadyExistsError) {
      return await ServiceContainer.tag.getTag.run({
        tagName,
      });
    }
    throw error;
  }
}

export async function createDetailIfNotExists(title: string) {
  const detailTitle = new DetailTitle(title);
  try {
    return await ServiceContainer.detail.createDetail.run({ detailTitle });
  } catch (error) {
    if (error instanceof DetailAlreadyExistsError) {
      return await ServiceContainer.detail.getDetail.run({
        detailTitle,
      });
    }
    throw error;
  }
}

type testOrderProduct = {
  productId?: string;
  productVariants?: {
    variantId?: string;
    variantSizes?: {
      quantity?: number;
      sizeValue?: number;
    }[];
  }[];
};

export async function createTestOrder(params?: {
  orderStatus?: OrderStatusOptions;
  creatorDetails?: {
    creatorId: string;
  };
  customer?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  shippingAddress?: {
    commune?: string;
    region?: string;
    streetName?: string;
    streetNumber?: string;
    additionalInfo?: string;
  };
  orderProducts?: [testOrderProduct, ...testOrderProduct[]];
  paymentInfo?: {
    paymentAt: Date | null;
    paymentStatus: OrderPaymentStatusOptions;
    paymentDeadline: Date;
  };
}) {
  const defaultProduct = await createTestProduct();
  const defaultOrderProducts = [
    {
      productId: defaultProduct.productId,
      productVariants: [
        {
          variantId: defaultProduct.variants[0].variantId,
          variantSizes: [
            {
              quantity: defaultProduct.variants[0].sizes[0].stock - 1,
              sizeValue: defaultProduct.variants[0].sizes[0].sizeValue,
            },
          ],
        },
      ],
    },
  ];

  const admin = await ServiceContainer.admin.getAdmin.run({
    adminEmail: initialSuperAdminUser.email,
  });

  const primitiveOrderProducts =
    params?.orderProducts?.map((product) => ({
      productId: product.productId ?? defaultOrderProducts[0].productId,
      productVariants:
        product.productVariants?.map((variant) => ({
          variantId:
            variant.variantId ??
            defaultOrderProducts[0].productVariants[0].variantId,
          variantSizes:
            variant.variantSizes?.map((size) => ({
              quantity:
                size.quantity ??
                defaultOrderProducts[0].productVariants[0].variantSizes[0]
                  .quantity,
              sizeValue:
                size.sizeValue ??
                defaultOrderProducts[0].productVariants[0].variantSizes[0]
                  .sizeValue,
            })) ?? defaultOrderProducts[0].productVariants[0].variantSizes,
        })) ?? defaultOrderProducts[0].productVariants,
    })) ?? defaultOrderProducts;

  const orderProducts: OrderItem[] = primitiveOrderProducts.map(
    (orderProduct): OrderItem => {
      const productVariants: OrderVariantWrite[] =
        orderProduct.productVariants.map((variant): OrderVariantWrite => {
          const variantSizes: OrderVariantSize[] = variant.variantSizes.map(
            (size): OrderVariantSize => {
              return new OrderVariantSize({
                quantity: new PositiveInteger(size.quantity),
                sizeValue: new PositiveInteger(size.sizeValue),
              });
            }
          );

          return new OrderVariantWrite({
            variantId: new UUID(variant.variantId),
            variantSizes,
          });
        });

      return {
        productId: new UUID(orderProduct.productId),
        productVariants,
      };
    }
  );

  const customer = new Customer({
    email: new Email(params?.customer?.email ?? "example@example.com"),
    firstName: new CustomerFirstName(params?.customer?.firstName ?? "John"),
    lastName: new CustomerLastName(params?.customer?.lastName ?? "Doe"),
    phone: new Phone(params?.customer?.phone ?? "+56 123456789"),
  });

  const creatorDetails = new OrderCreatorDetails({
    orderCreator:
      params?.creatorDetails || params?.paymentInfo || !params
        ? OrderCreator.create.admin()
        : OrderCreator.create.guest(),
    creatorId: params?.creatorDetails
      ? new UUID(params?.creatorDetails.creatorId)
      : params?.paymentInfo || !params
        ? new UUID(admin.getAdminId())
        : undefined,
  });

  const shippingAddress = new ShippingAddress({
    region: params?.shippingAddress?.region ?? CountryData.regions[0].name,
    commune:
      params?.shippingAddress?.commune ?? CountryData.regions[0].communes[0],
    streetName: params?.shippingAddress?.streetName ?? "Main St",
    streetNumber: params?.shippingAddress?.streetNumber ?? "123",
    additionalInfo: params?.shippingAddress?.additionalInfo ?? "Apt 4B",
  });

  const orderStatus = new OrderStatus(
    params?.orderStatus ?? OrderStatusOptions.WAITING_FOR_SHIPMENT
  );

  const paymentDeadline =
    params?.paymentInfo?.paymentDeadline ??
    new Date(Date.now() + 1000 * 60 * 60 * 24);

  const paymentInfo = new OrderPaymentInfo({
    paymentAt:
      params?.paymentInfo?.paymentAt || params?.paymentInfo?.paymentAt === null
        ? params?.paymentInfo.paymentAt
        : new Date(),
    paymentDeadline,
    paymentStatus: new OrderPaymentStatus(
      params?.paymentInfo?.paymentStatus ?? OrderPaymentStatusOptions.PAID
    ),
  });

  const isCreatorPresent =
    params?.creatorDetails || params?.paymentInfo || !params;
  const order = isCreatorPresent
    ? await ServiceContainer.order.createAdminOrder.run({
        creatorDetails,
        orderStatus,
        customer,
        shippingAddress,
        orderProducts,
        paymentInfo,
      })
    : await ServiceContainer.order.createCustomerOrder.run({
        customer,
        orderProducts,
        shippingAddress,
      });

  return {
    orderId: order.orderId.getValue(),
  };
}
