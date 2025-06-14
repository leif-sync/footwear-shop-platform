import { api } from "../../api.js";
import { test, expect } from "vitest";
import { tagUrlPath } from "../shared.js";
import { loginTest } from "../../helper.js";

test("list tags with invalid limit and offset", async () => {
  const cookieToken = await loginTest();
  const limit = 1000;
  const offset = -7;
  const url = `${tagUrlPath}?limit=${limit}&offset=${offset}`;
  const response = await api.get(url).set("Cookie", cookieToken);

  expect(response.ok).toBe(false);
});
