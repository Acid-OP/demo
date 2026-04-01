import * as Sentry from "@sentry/node";

type LogLevel = "info" | "warn" | "error" | "debug";

function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const entry = { timestamp, level, message, ...data };

  switch (level) {
    case "error":
      console.error(JSON.stringify(entry));
      Sentry.logger.error(message, data);
      break;
    case "warn":
      console.warn(JSON.stringify(entry));
      Sentry.logger.warn(message, data);
      break;
    case "debug":
      console.debug(JSON.stringify(entry));
      Sentry.logger.debug(message, data);
      break;
    default:
      console.log(JSON.stringify(entry));
      Sentry.logger.info(message, data);
  }
}

export const logger = {
  info: (message: string, data?: Record<string, unknown>) => log("info", message, data),
  warn: (message: string, data?: Record<string, unknown>) => log("warn", message, data),
  error: (message: string, data?: Record<string, unknown>) => log("error", message, data),
  debug: (message: string, data?: Record<string, unknown>) => log("debug", message, data),
};
