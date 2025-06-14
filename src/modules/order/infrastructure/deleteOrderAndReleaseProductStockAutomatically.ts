import { ServiceContainer } from "../../shared/infrastructure/serviceContainer.js";
import { CronJob } from "cron";
import { PRODUCT_STOCK_RELEASE_CRON_EXPRESSION } from "../../../environmentVariables.js";

async function releaseProductStock() {
  await ServiceContainer.order.deleteOrderAndReleaseProductStock.run();
}

CronJob.from({
  cronTime: PRODUCT_STOCK_RELEASE_CRON_EXPRESSION,
  onTick: releaseProductStock,
  start: true,
});
