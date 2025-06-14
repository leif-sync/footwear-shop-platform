import { test, expect } from "vitest";
import { api } from "../../api";
import { ordersPathUrl } from "../shared";
import { createTestOrder, loginTest } from "../../helper";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import { orderPaymentStatusOptions } from "../../../src/modules/order/domain/orderPaymentStatus";
import { orderStatusOptions } from "../../../src/modules/order/domain/orderStatus";
import { ServiceContainer } from "../../../src/modules/shared/infrastructure/serviceContainer";

test("update partial order", async () => {
  const { orderId } = await createTestOrder({
    orderStatus: orderStatusOptions.WAITING_FOR_PAYMENT,
    paymentInfo: {
      paymentStatus: orderPaymentStatusOptions.PENDING,
      paymentDeadline: new Date("2025-12-31T23:59:59.999Z"),
      paymentAt: null,
    },
  });

  const token = await loginTest();

  const updatedCustomer = {
    firstName: "UpdatedFirstName",
    lastName: "UpdatedLastName",
    email: "updated.email@example.com",
    phone: "+1234567890",
  };

  const updatedShippingAddress = {
    region: "Metropolitana de Santiago",
    commune: "Santiago",
    streetName: "Updated Street",
    streetNumber: "1234",
    additionalInfo: "Updated additional info",
  };

  const updatedPaymentInfo = {
    paymentDeadline: new Date("2025-12-31T23:59:59.999Z"),
    paymentStatus: orderPaymentStatusOptions.PAID,
    paymentAt: new Date("2025-12-31T23:59:59.999Z"),
  };

  const orderStatus = orderStatusOptions.WAITING_FOR_SHIPMENT;

  const response = await api
    .patch(`${ordersPathUrl}/${orderId}`)
    .set("Cookie", token)
    .send({
      customer: updatedCustomer,
      shippingAddress: updatedShippingAddress,
      paymentInfo: updatedPaymentInfo,
      orderStatus,
    });

  expect(response.statusCode).toBe(HTTP_STATUS.NO_CONTENT);

  const orderFound = await ServiceContainer.order.getOrder.run({ orderId });

  expect(orderFound).toBeDefined();
  expect(orderFound).toMatchObject({
    customer: {
      firstName: updatedCustomer.firstName,
      lastName: updatedCustomer.lastName,
      email: updatedCustomer.email,
    },
    shippingAddress: updatedShippingAddress,
    paymentInfo: updatedPaymentInfo,
    status: orderStatus,
  });

  expect(orderFound.customer.phone.replaceAll(" ", "")).toBe(
    updatedCustomer.phone
  );
});
