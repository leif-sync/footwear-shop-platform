import { api } from "../../api";
import { test, expect } from "vitest";
import { tagUrlPath } from "../shared";
import { createTagIfNotExists, loginTest } from "../../helper";

test("delete tag", async () => {
  const cookieToken = await loginTest();
  // create initial tag
  const tagName = "Tag to delete" + Math.floor(Math.random() * 1000);
  const { tagId } = await createTagIfNotExists(tagName);

  const url = `${tagUrlPath}/${tagId}`;
  const response = await api.delete(url).set("Cookie", cookieToken);

  expect(response.ok).toBe(true);
});
