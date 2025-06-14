import { api } from "../../api";
import { test, expect } from "vitest";
import { tagUrlPath } from "../shared";
import { randomUUID } from "node:crypto";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import { loginTest } from "../../helper";

test("delete inexistent tag", async () => {
  const cookieToken = await loginTest();
  // create initial tag
  const tagId = randomUUID();

  const url = `${tagUrlPath}/${tagId}`;
  const response = await api.delete(url).set("Cookie", cookieToken);

  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
});
