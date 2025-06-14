import { test, expect } from "vitest";
import { api } from "../../api.js";
import { categoryPathUrl } from "../shared.js";
import { createCategoryIfNotExists, createTestProduct, loginTest } from "../../helper.js";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus.js";

test("delete category", async () => {
  const cookieToken = await loginTest();
  const categoryName =
    "DELETE_CATEGORY_TEST" + Math.floor(Math.random() * 1000);
  const { categoryId } = await createCategoryIfNotExists(categoryName);
  await createTestProduct({ categories: [categoryName] });

  const response = await api
    .delete(`${categoryPathUrl}/${categoryId}`)
    .set("cookie", cookieToken);

  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.CONFLICT);
});
