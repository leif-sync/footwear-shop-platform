import { expect, test } from "vitest";
import { api } from "../../api";
import { paymentsPathUrl } from "../shared";
import { loginTest } from "../../helper";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";

test("list payments with invalid offset", async () => {
  const cookieToken = await loginTest();

  const invalidOffsets = [-1];
  const limit = 1;

  invalidOffsets.forEach(async (offset) => {
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
