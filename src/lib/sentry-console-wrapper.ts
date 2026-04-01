import * as Sentry from "@sentry/node";

export function wrapConsoleWithSentry() {
  const _log = console.log;
  const _info = console.info;
  const _warn = console.warn;
  const _error = console.error;
  const _debug = console.debug;

  let _forwarding = false;

  function serialize(arg: unknown): string {
    if (typeof arg === "string") return arg;
    if (arg instanceof Error) return arg.stack || arg.message;
    try {
      return JSON.stringify(arg);
    } catch {
      return String(arg);
    }
  }

  function toMessage(args: unknown[]): string {
    return args.map(serialize).join(" ");
  }

  console.log = (...args: unknown[]) => {
    _log.apply(console, args);
    if (_forwarding) return;
    _forwarding = true;
    try { Sentry.logger.info(toMessage(args)); } catch { /* noop */ }
    _forwarding = false;
  };

  console.info = (...args: unknown[]) => {
    _info.apply(console, args);
    if (_forwarding) return;
    _forwarding = true;
    try { Sentry.logger.info(toMessage(args)); } catch { /* noop */ }
    _forwarding = false;
  };

  console.warn = (...args: unknown[]) => {
    _warn.apply(console, args);
    if (_forwarding) return;
    _forwarding = true;
    try { Sentry.logger.warn(toMessage(args)); } catch { /* noop */ }
    _forwarding = false;
  };

  console.error = (...args: unknown[]) => {
    _error.apply(console, args);
    if (_forwarding) return;
    _forwarding = true;
    try { Sentry.logger.error(toMessage(args)); } catch { /* noop */ }
    _forwarding = false;
  };

  console.debug = (...args: unknown[]) => {
    _debug.apply(console, args);
    if (_forwarding) return;
    _forwarding = true;
    try { Sentry.logger.debug(toMessage(args)); } catch { /* noop */ }
    _forwarding = false;
  };
}
