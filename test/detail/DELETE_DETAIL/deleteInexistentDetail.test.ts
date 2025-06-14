import { test, expect } from "vitest";
import { api } from "../../api";
import { detailPathUrl } from "../shared";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import { randomUUID } from "node:crypto";
import { loginTest } from "../../helper";

test("delete inexistent detail", async () => {
  const cookieToken = await loginTest();
  const detailId = randomUUID();

  const response = await api
    .delete(`${detailPathUrl}/${detailId}`)
    .set("Cookie", cookieToken);

  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
});
