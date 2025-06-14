import { expect, test } from "vitest";
import { sizePathUrl } from "../shared";
import { api } from "../../api";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";
import { loginTest } from "../../helper";

test("create valid size", async () => {
  const cookieToken = await loginTest();
  const newSize = 20;
  const response = await api
    .post(sizePathUrl)
    .send({
      sizeValue: newSize,
    })
    .set("Cookie", cookieToken);

  expect(response.ok).toBe(true);
  expect(response.status).toBe(HTTP_STATUS.CREATED);
});
