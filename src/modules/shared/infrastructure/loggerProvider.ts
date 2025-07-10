import { Logger } from "../domain/logger.js";
import { ConsoleLogger } from "./consoleLogger.js";

export enum LoggerProviderOptions {
  DEBUG = "DEBUG",
}
export const LoggerProvider: Record<LoggerProviderOptions, Logger> = {
  [LoggerProviderOptions.DEBUG]: new ConsoleLogger(),
};
