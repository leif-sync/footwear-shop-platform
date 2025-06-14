import { test, expect } from "vitest";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import { api } from "../../api";
import { productsUrlPath } from "../shared";

test(`create product without authentication`, async () => {
  const response = await api.post(productsUrlPath);
  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
});
