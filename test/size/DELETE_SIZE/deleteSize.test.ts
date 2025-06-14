import { sizePathUrl } from "../shared";
import { api } from "../../api";
import { expect, test } from "vitest";
import { createSizeIfNotExists, loginTest } from "../../helper";

test("delete size", async () => {
  const cookieToken = await loginTest();
  const sizeToDelete = 20;
  const { sizeId } = await createSizeIfNotExists(sizeToDelete);

  const response = await api
    .delete(`${sizePathUrl}/${sizeId}`)
    .set("Cookie", cookieToken);

  expect(response.ok).toBe(true);
});
