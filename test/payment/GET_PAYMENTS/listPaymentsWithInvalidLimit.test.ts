import { expect, test } from "vitest";
import { api } from "../../api";
import { paymentsPathUrl } from "../shared";
import { loginTest } from "../../helper";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";

test("list payments with invalid limit", async () => {
  const cookieToken = await loginTest();

  const invalidLimits = [-1, 1001, 10000];
  const offset = 0;

  invalidLimits.forEach(async (limit) => {
    const response = await api
      .get(paymentsPathUrl)
      .query({
        limit,
        offset,
      })
      .set("Cookie", cookieToken);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });
});
