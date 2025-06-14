import { api } from "../../api.js";
import { test, expect } from "vitest";
import { tagUrlPath } from "../shared.js";
import { loginTest } from "../../helper.js";

test("list tags", async () => {
  const cookieToken = await loginTest();
  const limit = 10;
  const offset = 0;
  const url = `${tagUrlPath}?limit=${limit}&offset=${offset}`;
  const response = await api.get(url).set("Cookie", cookieToken);

  expect(response.ok).toBe(true);
  expect(response.body).toMatchObject({
    tags: expect.arrayContaining([
      {
        tagName: expect.any(String),
        tagId: expect.any(String),
      },
    ]),
    meta: {
      limit,
      offset,
      returnedTagCount: expect.any(Number),
      totalTagCount: expect.any(Number),
    },
  });
});
