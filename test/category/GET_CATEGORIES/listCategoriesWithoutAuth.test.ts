import { test, expect } from "vitest";
import { api } from "../../api";
import { categoryPathUrl } from "../shared";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";

test("list categories without auth", async () => {
  const limit = 10;
  const offset = 0;

  const response = await api.get(categoryPathUrl).query({ limit, offset });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
});
