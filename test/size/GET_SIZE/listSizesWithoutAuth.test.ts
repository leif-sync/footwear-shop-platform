import { test, expect } from "vitest";
import { api } from "../../api";
import { sizePathUrl } from "../shared";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";

test("list sizes without auth", async () => {
  const limit = 10;
  const offset = 0;
  const url = `${sizePathUrl}?limit=${limit}&offset=${offset}`;

  const response = await api.get(url);

  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
});
