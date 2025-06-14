import { test, expect } from "vitest";
import { api } from "../../api";
import { detailPathUrl } from "../shared";
import { loginTest } from "../../helper";

test("list details", async () => {
  const cookieToken = await loginTest();
  const limit = 1000;
  const offset = 0;

  const response = await api
    .get(detailPathUrl)
    .query({ limit, offset })
    .set("Cookie", cookieToken);

  expect(response.ok).toBe(false);
});
