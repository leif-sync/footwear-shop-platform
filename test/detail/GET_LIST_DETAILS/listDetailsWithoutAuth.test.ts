import { test, expect } from "vitest";
import { api } from "../../api";
import { detailPathUrl } from "../shared";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";

test("list details without auth", async () => {
  const limit = 10;
  const offset = 0;

  const response = await api.get(detailPathUrl).query({ limit, offset });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
});
