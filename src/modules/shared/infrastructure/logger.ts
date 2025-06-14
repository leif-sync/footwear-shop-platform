import { Logger } from "../domain/logger.js";
import { InMemoryLogger } from "./inMemoryLogger.js";

export const logger: Logger = new InMemoryLogger();
