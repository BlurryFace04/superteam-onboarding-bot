import { config } from './config.js';

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = LOG_LEVELS[config.logging.level] ?? LOG_LEVELS.info;

function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

export const logger = {
  debug(message, meta) {
    if (currentLevel <= LOG_LEVELS.debug) {
      console.log(formatMessage('debug', message, meta));
    }
  },

  info(message, meta) {
    if (currentLevel <= LOG_LEVELS.info) {
      console.log(formatMessage('info', message, meta));
    }
  },

  warn(message, meta) {
    if (currentLevel <= LOG_LEVELS.warn) {
      console.warn(formatMessage('warn', message, meta));
    }
  },

  error(message, meta) {
    if (currentLevel <= LOG_LEVELS.error) {
      console.error(formatMessage('error', message, meta));
    }
  },
};

export default logger;
