import { api } from "../../api.js";
import { test, expect } from "vitest";
import { tagUrlPath } from "../shared.js";

test("create a new tag", async () => {
  const newTag = Math.random().toString();
  const response = await api.post(tagUrlPath).send({
    tagName: newTag,
  });

  expect(response.ok).toBe(false);
});
