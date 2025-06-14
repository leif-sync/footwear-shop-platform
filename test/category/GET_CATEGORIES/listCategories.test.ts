import { test, expect } from "vitest";
import { api } from "../../api";
import { categoryPathUrl } from "../shared";

import { z } from "zod";
import { loginTest } from "../../helper";

const categoriesSchema = z.array(
  z.object({
    categoryId: z.string(),
    categoryName: z.string(),
  })
);

test("list categories", async () => {
  const cookieToken = await loginTest();
  const limit = 10;
  const offset = 0;

  const response = await api
    .get(categoryPathUrl)
    .query({ limit, offset })
    .set("Cookie", cookieToken);

  const returnedCategoriesCount = response.body.categories.length;

  expect(response.ok).toBe(true);
  expect(response.body).toMatchObject({
    categories: expect.any(Array),
    meta: {
      limit,
      offset,
      returnedCategoriesCount,
      totalCategoriesCount: expect.any(Number),
    },
  });
  expect(categoriesSchema.safeParse(response.body.categories).success).toBe(
    true
  );
});
