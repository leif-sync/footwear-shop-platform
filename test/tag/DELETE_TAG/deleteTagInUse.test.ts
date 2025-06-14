import { api } from "../../api";
import { test, expect } from "vitest";
import { tagUrlPath } from "../shared";
import {
  createTagIfNotExists,
  createTestProduct,
  loginTest,
} from "../../helper";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";

test("delete tag in use", async () => {
  const cookieToken = await loginTest();
  // create initial tag
  const tagName = "Tag to delete" + Math.floor(Math.random() * 1000);
  const { tagId } = await createTagIfNotExists(tagName);

  await createTestProduct({
    variants: [{ tags: [tagName] }],
  });

  const url = `${tagUrlPath}/${tagId}`;
  const response = await api.delete(url).set("Cookie", cookieToken);

  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.CONFLICT);
});
