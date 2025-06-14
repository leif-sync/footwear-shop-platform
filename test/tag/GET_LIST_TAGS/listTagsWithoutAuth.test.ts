import { api } from "../../api.js";
import { test, expect } from "vitest";
import { tagUrlPath } from "../shared.js";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus.js";

test("list tags without auth", async () => {
  const limit = 10;
  const offset = 0;
  const url = `${tagUrlPath}?limit=${limit}&offset=${offset}`;
  const response = await api.get(url);

  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
});
