import { api } from "../../api.js";
import { test, expect } from "vitest";
import { tagUrlPath } from "../shared.js";
import { loginTest } from "../../helper.js";

test("create duplicated tag", async () => {
  const cookieToken = await loginTest();
  const newTag = Math.random().toString();
  const response = await api.post(tagUrlPath).set("Cookie", cookieToken).send({
    tagName: newTag,
  });
  expect(response.ok).toBe(true);

  const responseDuplicated = await api
    .post(tagUrlPath)
    .set("Cookie", cookieToken)
    .send({
      tagName: newTag,
    });
  expect(responseDuplicated.ok).toBe(false);
});
