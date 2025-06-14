import { api } from "../../api";
import { test, expect } from "vitest";
import { categoryPathUrl } from "../shared";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import { createCategoryIfNotExists, loginTest } from "../../helper";

test("create duplicate category", async () => {
  const cookieToken = await loginTest();
  const categoryName = Math.random().toString();

  await createCategoryIfNotExists(categoryName);

  const response = await api
    .post(categoryPathUrl)
    .send({
      categoryName,
    })
    .set("Cookie", cookieToken);

  expect(response.status).toBe(HTTP_STATUS.CONFLICT);
});
