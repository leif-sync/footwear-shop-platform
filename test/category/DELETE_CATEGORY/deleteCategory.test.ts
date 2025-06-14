import { test, expect } from "vitest";
import { api } from "../../api.js";
import { categoryPathUrl } from "../shared.js";
import { createCategoryIfNotExists, loginTest } from "../../helper.js";

test("delete category", async () => {
  const cookieToken = await loginTest();
  const categoryName =
    "DELETE_CATEGORY_TEST" + Math.floor(Math.random() * 1000);
  const { categoryId } = await createCategoryIfNotExists(categoryName);
  const response = await api
    .delete(`${categoryPathUrl}/${categoryId}`)
    .set("cookie", cookieToken);

  expect(response.ok).toBe(true);
});
