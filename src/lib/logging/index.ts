const IP_REGEX = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const API_KEY_REGEX =
  /\b(?:api[_-]?key|apikey|secret|token|password|auth[_-]?token)[=:]\s*['"]?\S+['"]?/gi;
const QUERY_PII_REGEX = /[?&](?:email|password|token|secret|api_key|apikey|auth)=[^&\s]+/gi;

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

function sanitize(value: string): string {
  return value
    .replace(IP_REGEX, "[REDACTED_IP]")
    .replace(EMAIL_REGEX, "[REDACTED_EMAIL]")
    .replace(API_KEY_REGEX, "$1=[REDACTED]")
    .replace(QUERY_PII_REGEX, "");
}

function sanitizeMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (typeof value === "string") {
      result[key] = sanitize(value);
    } else if (value instanceof Error) {
      result[key] = { message: value.message, name: value.name };
    } else if (value && typeof value === "object") {
      result[key] = JSON.parse(sanitize(JSON.stringify(value)));
    } else {
      result[key] = value;
    }
  }
  return result;
}

function createEntry(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
  const sanitizedMessage = sanitize(message);
  const entry: LogEntry = {
    level,
    message: sanitizedMessage,
    timestamp: new Date().toISOString(),
  };
  if (meta && Object.keys(meta).length > 0) {
    entry.meta = sanitizeMeta(meta);
  }
  return entry;
}

function write(entry: LogEntry): void {
  const output = JSON.stringify(entry);
  switch (entry.level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    case "debug":
      if (process.env.NODE_ENV !== "production") {
        console.debug(output);
      }
      break;
    default:
      console.log(output);
  }
}

export function createLogger(namespace: string): Logger {
  return {
    debug(message: string, meta?: Record<string, unknown>) {
      write(createEntry("debug", `[${namespace}] ${message}`, meta));
    },
    info(message: string, meta?: Record<string, unknown>) {
      write(createEntry("info", `[${namespace}] ${message}`, meta));
    },
    warn(message: string, meta?: Record<string, unknown>) {
      write(createEntry("warn", `[${namespace}] ${message}`, meta));
    },
    error(message: string, meta?: Record<string, unknown>) {
      write(createEntry("error", `[${namespace}] ${message}`, meta));
    },
  };
}

export const auditLogger = createLogger("audit");
export const systemLogger = createLogger("system");
export const networkLogger = createLogger("network");
