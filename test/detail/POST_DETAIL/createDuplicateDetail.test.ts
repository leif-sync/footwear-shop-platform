import { test, expect } from "vitest";
import { api } from "../../api";
import { detailPathUrl } from "../shared";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import { createDetailIfNotExists, loginTest } from "../../helper.js";

test("create duplicate detail", async () => {
  const cookieToken = await loginTest();
  const newDetailTitle = "New Detail" + Math.random();

  await createDetailIfNotExists(newDetailTitle);

  const response = await api
    .post(detailPathUrl)
    .set("Cookie", cookieToken)
    .send({
      detailTitle: newDetailTitle,
    });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.CONFLICT);
});
