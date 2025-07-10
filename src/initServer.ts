import { app } from "./app.js";
import { PORT } from "./environmentVariables.js";
import { logger } from "./modules/shared/infrastructure/setupDependencies.js";

app.listen(PORT, () => {
  logger.info({
    message: `Server is running`,
    meta: { port: PORT },
  });
});
