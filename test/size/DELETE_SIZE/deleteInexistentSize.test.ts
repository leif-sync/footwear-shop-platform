import { sizePathUrl } from "../shared";
import { api } from "../../api";
import { expect, test } from "vitest";
import { randomUUID } from "node:crypto";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import { loginTest } from "../../helper";

test("delete inexistent size", async () => {
  const cookieToken = await loginTest();
  const sizeId = randomUUID();

  const response = await api
    .delete(`${sizePathUrl}/${sizeId}`)
    .set("Cookie", cookieToken);

  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
});
