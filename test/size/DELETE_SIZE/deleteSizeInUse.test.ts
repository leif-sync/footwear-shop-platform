import { sizePathUrl } from "../shared";
import { api } from "../../api";
import { expect, test } from "vitest";
import {
  createSizeIfNotExists,
  createTestProduct,
  loginTest,
} from "../../helper";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";

test("delete size in use", async () => {
  const cookieToken = await loginTest();
  const sizeToDelete = 20;
  const { sizeId } = await createSizeIfNotExists(sizeToDelete);

  await createTestProduct({
    variants: [{ sizes: [{ sizeValue: sizeToDelete }] }],
  });

  const response = await api
    .delete(`${sizePathUrl}/${sizeId}`)
    .set("Cookie", cookieToken);

  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.CONFLICT);
});
