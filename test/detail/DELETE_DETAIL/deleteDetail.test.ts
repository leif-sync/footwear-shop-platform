import { test, expect } from "vitest";
import { api } from "../../api";
import { detailPathUrl } from "../shared";
import { createDetailIfNotExists, loginTest } from "../../helper";

test("delete detail", async () => {
  const cookieToken = await loginTest();
  const detailToDelete = "detail-to-delete" + Math.random();
  const { detailId } = await createDetailIfNotExists(detailToDelete);

  const response = await api
    .delete(`${detailPathUrl}/${detailId}`)
    .set("Cookie", cookieToken);

  expect(response.ok).toBe(true);
});
