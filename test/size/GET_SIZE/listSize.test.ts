import { test, expect } from "vitest";
import { api } from "../../api";
import { sizePathUrl } from "../shared";
import { loginTest } from "../../helper";

test("list sizes", async () => {
  const cookieToken = await loginTest();
  const limit = 10;
  const offset = 0;
  const url = `${sizePathUrl}?limit=${limit}&offset=${offset}`;

  const response = await api.get(url).set("Cookie", cookieToken);

  expect(response.ok).toBe(true);
  expect(response.body).toMatchObject({
    sizes: expect.arrayContaining([
      {
        sizeId: expect.any(String),
        sizeValue: expect.any(Number),
      },
    ]),
    meta: expect.objectContaining({
      limit,
      offset,
      returnedSizeCount: expect.any(Number),
      totalSizeCount: expect.any(Number),
    }),
  });
});
