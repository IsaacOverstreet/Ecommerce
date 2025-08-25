import pino from "pino";

// production logger
const prodLogger = pino({
  level: "info",
  timestamp: () => `,"time": "${new Date().toISOString()}"`,
  formatters: {
    level: (label) => ({ level: label.toLocaleUpperCase() }),
  },
  redact: {
    paths: [
      "email",
      "password",
      "*.email",
      "*.password",
      "*.token",
      "*.accessToken",
    ],
    censor: "**REDACTED**",
  },
});

// Development logger
const devLogger = pino({
  level: "debug",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
      ignore: "pid,hostname",
    },
  },
});

// Conditional logger based on environment
export const logger =
  process.env.NODE_ENV === "production" ? prodLogger : devLogger;

//  Type-safe logging methods
export interface Logger {
  info: (msg: string, obj?: Record<string, unknown>) => void;
  error: (msg: string, obj?: Record<string, unknown>) => void;
  warn: (msg: string, obj?: Record<string, unknown>) => void;
  debug: (msg: string, obj?: Record<string, unknown>) => void;
}
