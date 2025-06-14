import { test, expect } from "vitest";
import { api } from "../../api";
import { sizePathUrl } from "../shared";
import { loginTest } from "../../helper";

test("list sizes", async () => {
  const cookieToken = await loginTest();
  const limit = 1000;
  const offset = -1;
  const url = `${sizePathUrl}?limit=${limit}&offset=${offset}`;

  const response = await api.get(url).set("Cookie", cookieToken);

  expect(response.ok).toBe(false);
});
