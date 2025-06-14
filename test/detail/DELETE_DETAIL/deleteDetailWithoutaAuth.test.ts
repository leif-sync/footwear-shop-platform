import { test, expect } from "vitest";
import { api } from "../../api";
import { detailPathUrl } from "../shared";
import { createDetailIfNotExists } from "../../helper";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";

test("delete detail without auth", async () => {
  const detailToDelete = "detail-to-delete" + Math.random();
  const { detailId } = await createDetailIfNotExists(detailToDelete);

  const response = await api
    .delete(`${detailPathUrl}/${detailId}`)

  expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
});
