import { test, expect } from "vitest";
import { api } from "../../api.js";
import { categoryPathUrl } from "../shared.js";
import { randomUUID } from "node:crypto";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus.js";
import { loginTest } from "../../helper.js";

test("delete inexistent category", async () => {
  const cookieToken = await loginTest();
  const categoryId = randomUUID();
  const response = await api
    .delete(`${categoryPathUrl}/${categoryId}`)
    .set("cookie", cookieToken);

  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
});
