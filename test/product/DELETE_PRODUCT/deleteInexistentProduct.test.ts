import { test, expect } from "vitest";
import { api } from "../../api";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import { productsUrlPath } from "../shared";
import { randomUUID } from "node:crypto";
import { loginTest } from "../../helper";

test("delete inexistent product ", async () => {
  const cookieToken = await loginTest();
  const publicProductId = randomUUID();

  const deleteResponse = await api
    .delete(`${productsUrlPath}/${publicProductId}`)
    .set("Cookie", cookieToken);

  expect(deleteResponse.ok).equals(false);
  expect(deleteResponse.status).equals(HTTP_STATUS.NOT_FOUND);
});
