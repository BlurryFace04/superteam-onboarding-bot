import 'dotenv/config';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseIntOrDefault(value, defaultValue) {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function parseBool(value, defaultValue = false) {
  if (value === undefined || value === '') return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

function parseAdminIds(value) {
  if (!value || value.trim() === '') return [];
  return value.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
}

export const config = {
  bot: {
    token: requireEnv('BOT_TOKEN'),
  },
  
  groups: {
    mainGroupId: parseInt(requireEnv('MAIN_GROUP_ID'), 10),
    introChannelId: process.env.INTRO_CHANNEL_ID 
      ? parseInt(process.env.INTRO_CHANNEL_ID, 10) 
      : parseInt(requireEnv('MAIN_GROUP_ID'), 10),
    introTopicId: process.env.INTRO_TOPIC_ID ? parseInt(process.env.INTRO_TOPIC_ID, 10) : null,
    useSingleGroup: !process.env.INTRO_CHANNEL_ID || process.env.INTRO_CHANNEL_ID === process.env.MAIN_GROUP_ID,
  },
  
  behavior: {
    deleteUnauthorizedMessages: parseBool(process.env.DELETE_UNAUTHORIZED_MESSAGES, true),
    reminderIntervalHours: parseIntOrDefault(process.env.REMINDER_INTERVAL_HOURS, 24),
  },
  
  validation: {
    minIntroLength: parseIntOrDefault(process.env.MIN_INTRO_LENGTH, 50),
    enableFormatValidation: parseBool(process.env.ENABLE_FORMAT_VALIDATION, false),
  },
  
  admin: {
    userIds: parseAdminIds(process.env.ADMIN_USER_IDS),
  },
  
  database: {
    path: process.env.DATABASE_PATH || './data/bot.db',
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;
