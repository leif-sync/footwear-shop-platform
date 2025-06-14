import { test, expect } from "vitest";
import { api } from "../../api";
import { detailPathUrl } from "../shared";

import { z } from "zod";
import { loginTest } from "../../helper";

const detailReturnSchema = z.array(
  z.object({
    detailId: z.string(),
    detailName: z.string(),
  })
);

test("list details", async () => {
  const cookieToken = await loginTest();
  const limit = 10;
  const offset = 0;

  const response = await api
    .get(detailPathUrl)
    .query({ limit, offset })
    .set("Cookie", cookieToken);

  const returnedDetailCount = response.body.details.length;

  expect(response.ok).toBe(true);
  expect(response.body).toMatchObject({
    details: expect.any(Array),
    meta: {
      limit,
      offset,
      returnedDetailCount,
      totalDetailCount: expect.any(Number),
    },
  });

  const parsedResponse = detailReturnSchema.safeParse(response.body.details);
  expect(parsedResponse.success).toBe(true);
});
