import { test, expect } from "vitest";
import { api } from "../../api";
import { detailPathUrl } from "../shared";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";

test("create detail without auth", async () => {
  const newDetailTitle = "New Detail" + Math.random();

  const response = await api.post(detailPathUrl).send({
    detailTitle: newDetailTitle,
  });

  expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
});
