import { AppImage } from "../../shared/domain/AppImage.js";
import { AppUrl } from "../../shared/domain/appUrl.js";
import { Email } from "../../shared/domain/email.js";
import { HexColor } from "../../shared/domain/hexColor.js";
import { NonNegativeInteger } from "../../shared/domain/nonNegativeInteger.js";
import { Phone } from "../../shared/domain/phone.js";
import { PositiveInteger } from "../../shared/domain/positiveInteger.js";
import { UUID } from "../../shared/domain/UUID.js";
import {
  prismaConnection,
  type PrismaTransaction,
  type PrismaConnection,
} from "../../shared/infrastructure/prismaClient.js";
import { Customer } from "../domain/customer.js";
import { CustomerFirstName } from "../domain/customerFirstName.js";
import { CustomerLastName } from "../domain/customerLastName.js";
import { OrderCreator } from "../domain/orderCreator.js";
import { OrderCreatorDetails } from "../domain/orderCreatorDetails.js";
import { OrderFull } from "../domain/orderFull.js";
import { OrderOverview } from "../domain/orderOverview.js";
import { OrderPaymentInfo } from "../domain/orderPaymentInfo.js";
import { OrderPaymentStatus } from "../domain/orderPaymentStatus.js";
import { OrderProduct } from "../domain/orderProduct.js";
import { OrderProductWrite } from "../domain/orderProductWrite.js";
import {
  OrderFilterCriteria,
  OrderRepository,
  OrderSearchOptions,
  PaginatedOrderFilterCriteria,
} from "../domain/orderRepository.js";
import { OrderStatus } from "../domain/orderStatus.js";
import { OrderVariant } from "../domain/orderVariant.js";
import { OrderVariantSize } from "../domain/orderVariantSize.js";
import { OrderVariantWrite } from "../domain/orderVariantWrite.js";
import { OrderWrite } from "../domain/orderWrite.js";
import { ShippingAddress } from "../domain/shippingAddress.js";

type storedVariantImage = {
  imageUrl: string;
  imageAlt: string;
};

export class PostgresOrderRepository implements OrderRepository {
  async create(params: { order: OrderWrite }): Promise<void> {
    const {
      orderId,
      orderStatus,
      customer,
      shippingAddress,
      orderProducts,
      createdAt,
      updatedAt,
      paymentInfo,
      creatorDetails,
    } = params.order.toPrimitives();

    const { email, firstName, lastName, phone } = customer;
    const { paymentAt, paymentDeadline, paymentStatus } = paymentInfo;
    const { creator: creatorType, creatorId } = creatorDetails;
    const { commune, region, streetName, streetNumber, additionalInfo } =
      shippingAddress;

    await prismaConnection.$transaction(async (tx) => {
      await tx.order.create({
        data: {
          orderId,
          orderStatus,
          customerEmail: email,
          customerFirstName: firstName,
          customerLastName: lastName,
          customerPhone: phone,
          shippingAddressCommune: commune,
          shippingAddressRegion: region,
          shippingAddressStreetName: streetName,
          shippingAddressStreetNumber: streetNumber,
          shippingAddressAdditionalInfo: additionalInfo,
          paymentStatus,
          paymentDeadline,
          paymentAt,
          creatorType,
          creatorId,
          createdAt,
          updatedAt,
        },
      });

      await this.createBatchOrderProducts({
        transaction: tx,
        orders: [
          {
            orderId: new UUID(orderId),
            orderProducts: orderProducts.map((product) =>
              OrderProductWrite.from(product)
            ),
          },
        ],
      });
    });
  }

  async checkIfOrderExists(params: OrderSearchOptions): Promise<boolean> {
    const orderId = params.orderId.getValue();

    const count = await prismaConnection.order.count({
      where: {
        orderId,
      },
    });

    return Boolean(count);
  }

  async countStoredOrders(
    params: OrderFilterCriteria
  ): Promise<NonNegativeInteger> {
    const { creator, orderStatus, customerEmail, paymentStatus } = params;
    const creators = creator
      ? Array.isArray(creator)
        ? creator.map((c) => c.getValue())
        : [creator.getValue()]
      : undefined;

    const orderStatuses = orderStatus
      ? Array.isArray(orderStatus)
        ? orderStatus.map((status) => status.getValue())
        : [orderStatus.getValue()]
      : undefined;

    const paymentStatuses = paymentStatus
      ? Array.isArray(paymentStatus)
        ? paymentStatus.map((status) => status.getValue())
        : [paymentStatus.getValue()]
      : undefined;

    const customerEmails = customerEmail
      ? Array.isArray(customerEmail)
        ? customerEmail.map((email) => email.getValue())
        : [customerEmail.getValue()]
      : undefined;

    const count = await prismaConnection.order.count({
      where: {
        ...(creators && { creatorType: { in: creators } }),
        ...(orderStatuses && { orderStatus: { in: orderStatuses } }),
        ...(paymentStatuses && { paymentStatus: { in: paymentStatuses } }),
        ...(customerEmails && { customerEmail: { in: customerEmails } }),
      },
    });

    return new NonNegativeInteger(count);
  }

  async checkIfProductIsBought(params: { productId: UUID }): Promise<boolean> {
    const productId = params.productId.getValue();

    const count = await prismaConnection.orderProduct.count({
      where: {
        productId,
      },
    });

    return Boolean(count);
  }

  async checkIfVariantIsBought(params: {
    productId: UUID;
    variantId: UUID;
  }): Promise<boolean> {
    const productId = params.productId.getValue();
    const variantId = params.variantId.getValue();

    const count = await prismaConnection.orderVariant.count({
      where: {
        orderProduct: {
          productId,
        },
        variantSize: {
          variantId,
        },
      },
    });

    return Boolean(count);
  }

  async find(params: OrderSearchOptions): Promise<OrderFull | null> {
    const orderId = params.orderId.getValue();

    const storedOrder = await prismaConnection.order.findUnique({
      where: {
        orderId,
      },
      include: {
        orderProducts: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
            orderVariants: {
              include: {
                variantSize: {
                  include: {
                    size: true,
                    variant: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!storedOrder) return null;

    const creatorDetails = new OrderCreatorDetails({
      orderCreator: OrderCreator.from(storedOrder.creatorType),
      creatorId: storedOrder.creatorId
        ? new UUID(storedOrder.creatorId)
        : undefined,
    });

    const customer = new Customer({
      email: new Email(storedOrder.customerEmail),
      firstName: new CustomerFirstName(storedOrder.customerFirstName),
      lastName: new CustomerLastName(storedOrder.customerLastName),
      phone: new Phone(storedOrder.customerPhone),
    });

    const shippingAddress = new ShippingAddress({
      commune: storedOrder.shippingAddressCommune,
      region: storedOrder.shippingAddressRegion,
      streetName: storedOrder.shippingAddressStreetName,
      streetNumber: storedOrder.shippingAddressStreetNumber,
      additionalInfo: storedOrder.shippingAddressAdditionalInfo
        ? storedOrder.shippingAddressAdditionalInfo
        : undefined,
    });

    const paymentInfo = new OrderPaymentInfo({
      paymentAt: storedOrder.paymentAt,
      paymentDeadline: storedOrder.paymentDeadline,
      paymentStatus: OrderPaymentStatus.from(storedOrder.paymentStatus),
    });

    const products = storedOrder.orderProducts.map((orderedProduct) => {
      type variantId = string;
      type variantDetails = {
        variantId: UUID;
        hexColor: HexColor;
        image: AppImage;
      };

      const MapVariantDetails = new Map<variantId, variantDetails>();
      const MapVariantSizes = new Map<variantId, OrderVariantSize[]>();

      orderedProduct.orderVariants.forEach((orderedVariant) => {
        const variantId = orderedVariant.variantSize.variant.variantId;
        const existsVariantDetails = MapVariantDetails.has(variantId);
        if (!existsVariantDetails) {
          const variantImages = orderedVariant.variantSize.variant
            .images as storedVariantImage[];

          const variantImagePreview = new AppImage({
            imageUrl: new AppUrl(variantImages[0].imageUrl),
            imageAlt: variantImages[0].imageAlt,
          });

          MapVariantDetails.set(variantId, {
            variantId: new UUID(orderedVariant.variantSize.variantId),
            hexColor: new HexColor(orderedVariant.variantSize.variant.hexColor),
            image: variantImagePreview,
          });
        }

        const variantSize = new OrderVariantSize({
          quantity: new PositiveInteger(orderedVariant.quantity),
          sizeValue: new PositiveInteger(
            orderedVariant.variantSize.size.sizeValue
          ),
        });

        const orderVariantSizes = MapVariantSizes.get(variantId) ?? [];
        orderVariantSizes.push(variantSize);
        MapVariantSizes.set(variantId, orderVariantSizes);
      });

      const productVariants = Array.from(MapVariantDetails.values()).map(
        (variantDetails) => {
          const variantSizes = MapVariantSizes.get(
            variantDetails.variantId.getValue()
          );

          if (!variantSizes) {
            throw new Error(
              `Variant sizes not found for variantId: ${variantDetails.variantId.getValue()},
               this should never happen, please check the database integrity.`
            );
          }

          return new OrderVariant({
            variantId: variantDetails.variantId,
            hexColor: variantDetails.hexColor,
            image: variantDetails.image,
            variantSizes: variantSizes,
          });
        }
      );

      return new OrderProduct({
        productId: new UUID(orderedProduct.productId),
        productName: orderedProduct.product.name,
        unitPrice: new PositiveInteger(orderedProduct.unitPrice),
        productVariants,
      });
    });

    return new OrderFull({
      orderId: new UUID(orderId),
      orderStatus: OrderStatus.from(storedOrder.orderStatus),
      createdAt: storedOrder.createdAt,
      creatorDetails,
      customer,
      shippingAddress,
      updatedAt: storedOrder.updatedAt,
      paymentInfo,
      products,
    });
  }

  async delete(params: { orderId: UUID | UUID[] }): Promise<void> {
    const orderIds = Array.isArray(params.orderId)
      ? params.orderId.map((id) => id.getValue())
      : [params.orderId.getValue()];

    await prismaConnection.$transaction(async (tx) => {
      await tx.orderVariant.deleteMany({
        where: {
          orderProduct: {
            orderId: {
              in: orderIds,
            },
          },
        },
      });

      await tx.orderProduct.deleteMany({
        where: {
          orderId: {
            in: orderIds,
          },
        },
      });

      await tx.order.deleteMany({
        where: {
          orderId: {
            in: orderIds,
          },
        },
      });
    });
  }

  async listAllOrders(params: OrderFilterCriteria): Promise<OrderWrite[]> {
    const { creator, orderStatus, customerEmail, paymentStatus } = params;
    const creators = creator
      ? Array.isArray(creator)
        ? creator.map((c) => c.getValue())
        : [creator.getValue()]
      : undefined;

    const orderStatuses = orderStatus
      ? Array.isArray(orderStatus)
        ? orderStatus.map((status) => status.getValue())
        : [orderStatus.getValue()]
      : undefined;

    const paymentStatuses = paymentStatus
      ? Array.isArray(paymentStatus)
        ? paymentStatus.map((status) => status.getValue())
        : [paymentStatus.getValue()]
      : undefined;

    const customerEmails = customerEmail
      ? Array.isArray(customerEmail)
        ? customerEmail.map((email) => email.getValue())
        : [customerEmail.getValue()]
      : undefined;

    const storedOrders = await prismaConnection.order.findMany({
      where: {
        ...(creators && { creatorType: { in: creators } }),
        ...(orderStatuses && { orderStatus: { in: orderStatuses } }),
        ...(paymentStatuses && { paymentStatus: { in: paymentStatuses } }),
        ...(customerEmails && { customerEmail: { in: customerEmails } }),
      },
      include: {
        orderProducts: {
          select: {
            unitPrice: true,
            productId: true,
          },
          include: {
            orderVariants: {
              include: {
                variantSize: {
                  include: {
                    size: true,
                    variant: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const orderWrites = storedOrders.map((storedOrder) => {
      const customer = new Customer({
        email: new Email(storedOrder.customerEmail),
        firstName: new CustomerFirstName(storedOrder.customerFirstName),
        lastName: new CustomerLastName(storedOrder.customerLastName),
        phone: new Phone(storedOrder.customerPhone),
      });

      const shippingAddress = new ShippingAddress({
        commune: storedOrder.shippingAddressCommune,
        region: storedOrder.shippingAddressRegion,
        streetName: storedOrder.shippingAddressStreetName,
        streetNumber: storedOrder.shippingAddressStreetNumber,
        additionalInfo: storedOrder.shippingAddressAdditionalInfo
          ? storedOrder.shippingAddressAdditionalInfo
          : undefined,
      });

      const paymentInfo = new OrderPaymentInfo({
        paymentAt: storedOrder.paymentAt,
        paymentDeadline: storedOrder.paymentDeadline,
        paymentStatus: OrderPaymentStatus.from(storedOrder.paymentStatus),
      });

      const creatorDetails = new OrderCreatorDetails({
        orderCreator: OrderCreator.from(storedOrder.creatorType),
        creatorId: storedOrder.creatorId
          ? new UUID(storedOrder.creatorId)
          : undefined,
      });

      const orderProducts = storedOrder.orderProducts.map((orderedProduct) => {
        type variantId = string;
        type variantDetails = {
          variantId: UUID;
        };

        const MapVariantDetails = new Map<variantId, variantDetails>();
        const MapVariantSizes = new Map<variantId, OrderVariantSize[]>();

        orderedProduct.orderVariants.forEach((orderedVariant) => {
          const variantId = orderedVariant.variantSize.variant.variantId;
          const existsVariantDetails = MapVariantDetails.has(variantId);
          if (!existsVariantDetails) {
            MapVariantDetails.set(variantId, {
              variantId: new UUID(orderedVariant.variantSize.variantId),
            });
          }

          const variantSize = new OrderVariantSize({
            quantity: new PositiveInteger(orderedVariant.quantity),
            sizeValue: new PositiveInteger(
              orderedVariant.variantSize.size.sizeValue
            ),
          });

          const orderVariantSizes = MapVariantSizes.get(variantId) ?? [];
          orderVariantSizes.push(variantSize);
          MapVariantSizes.set(variantId, orderVariantSizes);
        });

        const productVariants = Array.from(MapVariantDetails.values()).map(
          (variantDetails) => {
            const variantSizes = MapVariantSizes.get(
              variantDetails.variantId.getValue()
            );

            if (!variantSizes) {
              throw new Error(
                `Variant sizes not found for variantId: ${variantDetails.variantId.getValue()},
               this should never happen, please check the database integrity.`
              );
            }

            return new OrderVariantWrite({
              variantId: variantDetails.variantId,
              variantSizes: variantSizes,
            });
          }
        );

        return new OrderProductWrite({
          productId: new UUID(orderedProduct.productId),
          unitPrice: new PositiveInteger(orderedProduct.unitPrice),
          productVariants,
        });
      });

      return new OrderWrite({
        orderId: new UUID(storedOrder.orderId),
        orderStatus: OrderStatus.from(storedOrder.orderStatus),
        customer,
        shippingAddress,
        paymentInfo,
        creatorDetails,
        orderProducts,
        createdAt: storedOrder.createdAt,
        updatedAt: storedOrder.updatedAt,
      });
    });

    return orderWrites;
  }

  async listOrderOverviews(
    params: PaginatedOrderFilterCriteria
  ): Promise<OrderOverview[]> {
    const { creator, customerEmail, orderStatus, paymentStatus } = params;

    const take = params.limit.getValue();
    const skip = params.offset.getValue();

    const creators = creator
      ? Array.isArray(creator)
        ? creator.map((c) => c.getValue())
        : [creator.getValue()]
      : undefined;

    const orderStatuses = orderStatus
      ? Array.isArray(orderStatus)
        ? orderStatus.map((status) => status.getValue())
        : [orderStatus.getValue()]
      : undefined;

    const paymentStatuses = paymentStatus
      ? Array.isArray(paymentStatus)
        ? paymentStatus.map((status) => status.getValue())
        : [paymentStatus.getValue()]
      : undefined;

    const customerEmails = customerEmail
      ? Array.isArray(customerEmail)
        ? customerEmail.map((email) => email.getValue())
        : [customerEmail.getValue()]
      : undefined;

    const storedOrders = await prismaConnection.order.findMany({
      where: {
        ...(creators && { creatorType: { in: creators } }),
        ...(orderStatuses && { orderStatus: { in: orderStatuses } }),
        ...(paymentStatuses && { paymentStatus: { in: paymentStatuses } }),
        ...(customerEmails && { customerEmail: { in: customerEmails } }),
      },
      include: {
        orderProducts: {
          select: {
            unitPrice: true,
          },
          include: {
            orderVariants: {
              select: {
                quantity: true,
              },
            },
          },
        },
      },
      skip,
      take,
    });

    const orderOverviews = storedOrders.map((storedOrder) => {
      const totalAmount = storedOrder.orderProducts.reduce((acc, product) => {
        const totalQuantity = product.orderVariants.reduce(
          (variantAcc, variant) => variantAcc + variant.quantity,
          0
        );
        const productTotal = product.unitPrice * totalQuantity;
        return acc + productTotal;
      }, 0);

      return new OrderOverview({
        customerEmail: new Email(storedOrder.customerEmail),
        paymentStatus: OrderPaymentStatus.from(storedOrder.paymentStatus),
        orderId: new UUID(storedOrder.orderId),
        orderStatus: OrderStatus.from(storedOrder.orderStatus),
        createdAt: storedOrder.createdAt,
        updatedAt: storedOrder.updatedAt,
        totalAmount: new NonNegativeInteger(totalAmount),
      });
    });

    return orderOverviews;
  }

  async update(params: { order: OrderWrite }): Promise<void> {
    const {
      orderId,
      orderStatus,
      customer,
      shippingAddress,
      paymentInfo,
      creatorDetails,
      createdAt,
      updatedAt,
    } = params.order.toPrimitives();

    const { email, firstName, lastName, phone } = customer;
    const { commune, region, streetName, streetNumber, additionalInfo } =
      shippingAddress;
    const { paymentAt, paymentDeadline, paymentStatus } = paymentInfo;
    const { creator: creatorType, creatorId } = creatorDetails;

    await prismaConnection.$transaction(async (tx) => {
      await tx.order.update({
        data: {
          orderStatus,
          customerEmail: email,
          customerFirstName: firstName,
          customerLastName: lastName,
          customerPhone: phone,
          shippingAddressCommune: commune,
          shippingAddressRegion: region,
          shippingAddressStreetName: streetName,
          shippingAddressStreetNumber: streetNumber,
          shippingAddressAdditionalInfo: additionalInfo,
          paymentStatus,
          paymentDeadline,
          paymentAt,
          creatorType,
          creatorId,
          createdAt,
          updatedAt,
        },
        where: {
          orderId,
        },
      });
    });
  }

  private async createBatchOrderProducts(params: {
    transaction?: PrismaTransaction;
    orders: {
      orderId: UUID;
      orderProducts: OrderProductWrite[];
    }[];
  }): Promise<void> {
    const { transaction } = params;

    const primitiveOrders = params.orders.map((item) => ({
      orderId: item.orderId.getValue(),
      orderProducts: item.orderProducts.map((product) =>
        product.toPrimitives()
      ),
    }));

    type OrderProductToCreate = {
      orderProductId: string;
      unitPrice: number;
      productId: string;
      orderId: string;
    };

    const runInTransaction = async (tx: PrismaTransaction): Promise<void> => {
      const orderProductsToCreate: OrderProductToCreate[] = [];
      const orderProductVariants: {
        orderProductId: UUID;
        orderProductVariants: OrderVariantWrite[];
      }[] = [];

      primitiveOrders.forEach((order) => {
        const { orderId, orderProducts } = order;

        orderProducts.forEach((orderProduct) => {
          const { productId, unitPrice, productVariants } = orderProduct;

          orderProductsToCreate.push({
            orderProductId: UUID.generateRandomUUID().getValue(),
            unitPrice: unitPrice,
            productId: productId,
            orderId: orderId,
          });

          const orderVariants = productVariants.map((orderProductVariant) => {
            return OrderVariantWrite.from(orderProductVariant);
          });

          orderProductVariants.push({
            orderProductId: new UUID(orderId),
            orderProductVariants: orderVariants,
          });
        });
      });

      await tx.orderProduct.createMany({
        data: orderProductsToCreate,
      });

      await this.createBatchOrderVariants({
        transaction: tx,
        products: orderProductVariants,
      });
    };

    if (transaction) {
      await runInTransaction(transaction);
      return;
    }

    await prismaConnection.$transaction(runInTransaction);
  }

  private async createBatchOrderVariants(params: {
    transaction?: PrismaTransaction;
    products: {
      orderProductId: UUID;
      orderProductVariants: OrderVariantWrite[];
    }[];
  }): Promise<void> {
    const { transaction } = params;

    const orderItemVariantsPrimitives = params.products.map((item) => ({
      orderProductId: item.orderProductId.getValue(),
      orderVariants: item.orderProductVariants.map((variant) =>
        variant.toPrimitives()
      ),
    }));

    type OrderVariantToCreate = {
      orderVariantId: string;
      orderProductId: string;
      variantSizeId: string;
      quantity: number;
    };

    const executeOrderVariantCreation = async (
      queryHandler: PrismaTransaction | PrismaConnection
    ): Promise<void> => {
      const variantSizesToSearch = orderItemVariantsPrimitives.flatMap(
        (orderItem) =>
          orderItem.orderVariants.flatMap((variant) =>
            variant.variantSizes.map((variantSize) => ({
              variantId: new UUID(variant.variantId),
              sizeValue: new PositiveInteger(variantSize.sizeValue),
            }))
          )
      );

      const variantSizes = await this.retrieveVariantSizes({
        variantSizes: variantSizesToSearch,
      });

      type variantId = string;
      type sizeValue = number;
      type variantId_sizeValue = `${variantId}_${sizeValue}`;
      type variantSizeId = string;
      const variantSizeMap = new Map<variantId_sizeValue, variantSizeId>();

      variantSizes.forEach((variantSize) => {
        const key: variantId_sizeValue = `${variantSize.variantId}_${variantSize.sizeValue.getValue()}`;
        variantSizeMap.set(key, variantSize.variantSizeId.getValue());
      });

      const orderVariantsToCreate: OrderVariantToCreate[] = [];

      orderItemVariantsPrimitives.forEach((orderProductItem) => {
        const orderProductId = orderProductItem.orderProductId;
        orderProductItem.orderVariants.forEach((variant) => {
          const orderVariantId = variant.variantId;
          variant.variantSizes.forEach((variantSize) => {
            const sizeValue = variantSize.sizeValue;
            const keyVariantSize: variantId_sizeValue = `${orderVariantId}_${sizeValue}`;
            const variantSizeId = variantSizeMap.get(keyVariantSize);

            if (!variantSizeId) {
              throw new Error(
                `Variant size not found for variantId: ${orderVariantId} and sizeValue: ${sizeValue},
                 this should never happen, please check the database integrity.`
              );
            }

            orderVariantsToCreate.push({
              orderVariantId: UUID.generateRandomUUID().getValue(),
              orderProductId,
              variantSizeId,
              quantity: variantSize.quantity,
            });
          });
        });
      });

      await queryHandler.orderVariant.createMany({
        data: orderVariantsToCreate,
      });
    };

    if (transaction) {
      await executeOrderVariantCreation(transaction);
      return;
    }

    await executeOrderVariantCreation(prismaConnection);
  }

  private async retrieveVariantSizes(params: {
    variantSizes: {
      variantId: UUID;
      sizeValue: PositiveInteger;
    }[];
  }): Promise<
    {
      variantId: UUID;
      sizeValue: PositiveInteger;
      variantSizeId: UUID;
    }[]
  > {
    const variantSizeIds = await prismaConnection.variantSize.findMany({
      where: {
        OR: params.variantSizes.map((size) => ({
          variantId: size.variantId.getValue(),
          sizeValue: size.sizeValue.getValue(),
        })),
      },
      include: {
        size: {
          select: {
            sizeValue: true,
          },
        },
      },
    });

    return variantSizeIds.map((variantSize) => ({
      variantId: new UUID(variantSize.variantId),
      variantSizeId: new UUID(variantSize.variantSizeId),
      sizeValue: new PositiveInteger(variantSize.size.sizeValue),
    }));
  }
}
