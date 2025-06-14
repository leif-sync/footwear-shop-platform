import { Logger } from "../domain/logger.js";
import { styleText } from "node:util";

export class InMemoryLogger implements Logger {
  async info(params: {
    message: string;
    meta?: Record<string, any>;
  }): Promise<void> {
    console.log();
    console.info("message:", styleText("blue", params.message));
    if (params.meta) console.info("meta:", params.meta);
    console.info("timestamp:", new Date());
    console.log();
  }

  async debug(params: {
    message: string;
    meta?: Record<string, any>;
  }): Promise<void> {
    console.log();
    console.debug("message:", styleText("green", params.message));
    if (params.meta) console.debug("meta:", params.meta);
    console.info("timestamp:", new Date());
    console.log();
  }

  async warn(params: {
    message: string;
    meta?: Record<string, any>;
  }): Promise<void> {
    console.log();
    console.warn("message:", styleText("yellow", params.message));
    if (params.meta) console.warn("meta:", params.meta);
    console.info("timestamp:", new Date());
    console.log();
  }

  async error(params: {
    message: string;
    error?: Error;
    meta?: Record<string, any>;
  }): Promise<void> {
    console.log();
    console.error("message:", styleText("red", params.message));
    if (params.meta) console.error("meta:", params.meta);
    if (params.error) console.error("error:", params.error);
    console.info("timestamp:", new Date());
    console.log();
  }

  fatal(params: {
    message: string;
    meta?: Record<string, any>;
    error?: Error;
  }): Promise<void> {
    console.log();
    console.error(
      "message:",
      styleText(["redBright", "italic", "bgWhite"], params.message)
    );
    if (params.meta) console.error("meta:", params.meta);
    if (params.error) console.error("error:", params.error);
    console.info("timestamp:", new Date());
    console.log();
    return Promise.resolve();
  }
}
