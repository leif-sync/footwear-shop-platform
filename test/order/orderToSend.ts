import { CountryData } from "../../src/modules/order/domain/countryData";
import {
  createOrderForAdminSchemaType,
  createOrderForUserSchemaType,
} from "../../src/modules/order/infrastructure/schemas/orderSchemas";
import type {
  DeepPartial,
  SmartOmit,
} from "../../src/modules/shared/domain/helperTypes";
import { returnIfNotUndefined } from "./shared";

const defaultCustomer: createOrderForUserSchemaType["customer"] = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+56 123456789",
};

const defaultShippingAddress: createOrderForUserSchemaType["shippingAddress"] =
  {
    region: CountryData.regions[0].name,
    commune: CountryData.regions[0].communes[0],
    streetName: "Main St",
    streetNumber: "123",
    additionalInfo: "Near the park",
  };

type userOrderToSendConstructorParams = DeepPartial<
  SmartOmit<createOrderForUserSchemaType, "orderProducts">
> &
  Pick<createOrderForUserSchemaType, "orderProducts">;

export class UserOrderToSend {
  protected order: createOrderForUserSchemaType;

  constructor(params: userOrderToSendConstructorParams) {
    this.order = {
      customer: {
        email: params.customer?.email ?? defaultCustomer.email,
        firstName: params.customer?.firstName ?? defaultCustomer.firstName,
        lastName: params.customer?.lastName ?? defaultCustomer.lastName,
        phone: params.customer?.phone ?? defaultCustomer.phone,
      },
      shippingAddress: {
        region: params.shippingAddress?.region ?? defaultShippingAddress.region,
        commune:
          params.shippingAddress?.commune ?? defaultShippingAddress.commune,
        streetName:
          params.shippingAddress?.streetName ??
          defaultShippingAddress.streetName,
        streetNumber:
          params.shippingAddress?.streetNumber ??
          defaultShippingAddress.streetNumber,
        additionalInfo: returnIfNotUndefined(
          params.shippingAddress?.additionalInfo,
          defaultShippingAddress.additionalInfo
        ),
      },
      orderProducts: params.orderProducts,
    };
  }

  toPrimitives() {
    return {
      customer: {
        email: this.order.customer.email,
        firstName: this.order.customer.firstName,
        lastName: this.order.customer.lastName,
        phone: this.order.customer.phone,
      },
      shippingAddress: {
        region: this.order.shippingAddress.region,
        commune: this.order.shippingAddress.commune,
        streetName: this.order.shippingAddress.streetName,
        streetNumber: this.order.shippingAddress.streetNumber,
        additionalInfo: this.order.shippingAddress.additionalInfo,
      },
      orderProducts: this.order.orderProducts,
    };
  }
}

export class AdminOrderToSend extends UserOrderToSend {
  private readonly paymentInfo: createOrderForAdminSchemaType["paymentInfo"];
  private readonly orderStatus: createOrderForAdminSchemaType["orderStatus"];

  constructor(
    params: DeepPartial<
      SmartOmit<
        createOrderForAdminSchemaType,
        "orderProducts" | "paymentInfo" | "orderStatus"
      >
    > &
      Pick<
        createOrderForAdminSchemaType,
        "orderProducts" | "paymentInfo" | "orderStatus"
      >
  ) {
    super(params);
    this.paymentInfo = params.paymentInfo;
    this.orderStatus = params.orderStatus;
  }

  override toPrimitives() {
    return {
      ...super.toPrimitives(),
      orderStatus: this.orderStatus,
      paymentInfo: this.paymentInfo,
    };
  }
}
