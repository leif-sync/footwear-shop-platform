import { api } from "../../api";
import { test, expect } from "vitest";
import { tagUrlPath } from "../shared";
import { createTagIfNotExists } from "../../helper";

test("delete tag without auth", async () => {
  const tagName = "Tag to delete" + Math.floor(Math.random() * 1000);
  const { tagId } = await createTagIfNotExists(tagName);

  const url = `${tagUrlPath}/${tagId}`;
  const response = await api.delete(url);

  expect(response.ok).toBe(false);
});
