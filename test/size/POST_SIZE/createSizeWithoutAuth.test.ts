import { expect, test } from "vitest";
import { sizePathUrl } from "../shared";
import { api } from "../../api";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";

test("create valid size", async () => {
  const newSize = 20;
  const response = await api.post(sizePathUrl).send({
    sizeValue: newSize,
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
});
 