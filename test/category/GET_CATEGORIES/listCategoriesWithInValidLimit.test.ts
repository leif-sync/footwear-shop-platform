import { test, expect } from "vitest";
import { api } from "../../api";
import { categoryPathUrl } from "../shared";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import { loginTest } from "../../helper";

test("list categories with invalid limit", async () => {
  const cookieToken = await loginTest();
  const limit = 1000;
  const offset = 0;

  const response = await api
    .get(categoryPathUrl)
    .query({ limit, offset })
    .set("Cookie", cookieToken);

  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
});
