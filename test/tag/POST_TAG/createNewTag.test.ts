import { api } from "../../api.js";
import { test, expect } from "vitest";
import { tagUrlPath } from "../shared.js";
import { loginTest } from "../../helper.js";

test("create a new tag", async () => {
  const cookieToken = await loginTest();
  const newTag = Math.random().toString();
  const response = await api.post(tagUrlPath).set("Cookie", cookieToken).send({
    tagName: newTag,
  });

  expect(response.ok).toBe(true);
  expect(response.body).toMatchObject({
    tag: {
      tagId: expect.any(String),
    },
  });
});
