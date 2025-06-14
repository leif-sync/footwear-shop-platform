import { sizePathUrl } from "../shared";
import { api } from "../../api";
import { expect, test } from "vitest";
import { createSizeIfNotExists } from "../../helper";
import { HTTP_STATUS } from "../../../src/modules/shared/infrastructure/httpStatus";

test("delete size without auth", async () => {
  const sizeToDelete = 20;
  const { sizeId } = await createSizeIfNotExists(sizeToDelete);

  const response = await api.delete(`${sizePathUrl}/${sizeId}`);

  expect(response.ok).toBe(false);
  expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
});
