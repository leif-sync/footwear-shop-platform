import { test, expect } from "vitest";
import { api } from "../../api";
import { detailPathUrl } from "../shared";
import {
  createDetailIfNotExists,
  createTestProduct,
  loginTest,
} from "../../helper";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";

test("delete detail in use", async () => {
  const cookieToken = await loginTest();
  const detailToDelete = "detail-to-delete" + Math.random();
  const { detailId } = await createDetailIfNotExists(detailToDelete);
  await createTestProduct({
    variants: [{ details: [{ title: detailToDelete }] }],
  });

  const response = await api
    .delete(`${detailPathUrl}/${detailId}`)
    .set("Cookie", cookieToken);

  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.CONFLICT);
});
