import { api } from "../../api";
import { test, expect } from "vitest";
import { categoryPathUrl } from "../shared";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";

test("create category without auth", async () => {
  const categoryName = Math.random().toString();
  const response = await api.post(categoryPathUrl).send({
    categoryName,
  });

  expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
});
