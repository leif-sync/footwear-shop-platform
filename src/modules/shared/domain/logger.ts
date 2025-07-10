export abstract class Logger {
  abstract info(params: {
    message: string;
    meta?: Record<string, any>;
  }): Promise<void>;

  abstract debug(params: {
    message: string;
    meta?: Record<string, any>;
  }): Promise<void>;

  abstract warn(params: {
    message: string;
    meta?: Record<string, any>;
  }): Promise<void>;

  abstract error(params: {
    message: string;
    error?: unknown;
    meta?: Record<string, any>;
  }): Promise<void>;

  abstract fatal(params: {
    message: string;
    meta?: Record<string, any>;
    error?: unknown;
  }): Promise<void>;
}
