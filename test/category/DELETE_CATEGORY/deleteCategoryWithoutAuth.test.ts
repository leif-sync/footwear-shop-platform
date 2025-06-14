import { test, expect } from "vitest";
import { api } from "../../api.js";
import { categoryPathUrl } from "../shared.js";
import { createCategoryIfNotExists } from "../../helper.js";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus.js";

test("delete category without auth", async () => {
  const categoryName = "DELETE_CATEGORY_TEST" + Math.floor(Math.random() * 1000);
  const { categoryId } = await createCategoryIfNotExists(categoryName);
  const response = await api
    .delete(`${categoryPathUrl}/${categoryId}`)

  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
});