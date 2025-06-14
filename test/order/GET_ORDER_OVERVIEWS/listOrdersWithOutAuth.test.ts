import { api } from "../../api.ts";
import { expect, test } from "vitest";
import { createTestOrder } from "../../helper.ts";
import { ordersPathUrl } from "../shared.ts";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus.ts";

test("list orders without auth", async () => {
  for (let i = 0; i < 20; i++) await createTestOrder();

  const limit = 10;
  const offset = 0;

  const response = await api.get(ordersPathUrl).query({
    limit,
    offset,
  });

  expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
});
