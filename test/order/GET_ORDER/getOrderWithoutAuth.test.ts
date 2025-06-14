import { test, expect } from "vitest";
import { createTestOrder } from "../../helper.ts";
import { api } from "../../api.ts";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus.ts";
import { ordersPathUrl } from "../shared.ts";

test("get order by id without auth", async () => {
  const order = await createTestOrder();
  const response = await api.get(`${ordersPathUrl}/${order.orderId}`);
  expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
});
