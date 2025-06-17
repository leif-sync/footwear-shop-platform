import { test, expect } from "vitest";
import { api } from "../../api";
import { detailPathUrl } from "../shared";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import { loginTest } from "../../helper";

test("create detail", async () => {
  const cookieToken = await loginTest();
  const newDetailTitle = "New Detail" + Math.random();

  const response = await api
    .post(detailPathUrl)
    .set("Cookie", cookieToken)
    .send({
      detailTitle: newDetailTitle,
    });

  expect(response.status).toBe(HTTP_STATUS.CREATED);
});
