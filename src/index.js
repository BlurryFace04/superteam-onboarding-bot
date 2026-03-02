import { Telegraf } from 'telegraf';
import { config } from './config.js';
import { initDatabase, closeDatabase } from './database.js';
import { logger } from './logger.js';
import {
  setupNewMemberHandler,
  setupIntroDetectionHandler,
  setupAccessControlHandler,
  setupCommandHandlers,
} from './handlers/index.js';

async function main() {
  logger.info('Starting Superteam Intro Gatekeeper Bot...');

  try {
    initDatabase();
    logger.info('Database initialized');
  } catch (error) {
    logger.error('Failed to initialize database', { error: error.message });
    process.exit(1);
  }

  const bot = new Telegraf(config.bot.token);

  bot.catch((err, ctx) => {
    logger.error('Bot error', { 
      error: err.message, 
      updateType: ctx.updateType 
    });
  });

  setupCommandHandlers(bot);
  setupNewMemberHandler(bot);
  setupIntroDetectionHandler(bot);
  setupAccessControlHandler(bot);

  const gracefulShutdown = async (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    bot.stop(signal);
    closeDatabase();
    process.exit(0);
  };

  process.once('SIGINT', () => gracefulShutdown('SIGINT'));
  process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));

  try {
    const botInfo = await bot.telegram.getMe();
    logger.info('Bot connected', { 
      username: botInfo.username, 
      id: botInfo.id 
    });

    logger.info('Configuration', {
      mainGroupId: config.groups.mainGroupId,
      introTopicId: config.groups.introTopicId,
      deleteUnauthorizedMessages: config.behavior.deleteUnauthorizedMessages,
      adminCount: config.admin.userIds.length,
    });

    await bot.launch({
      allowedUpdates: ['message', 'edited_message', 'chat_member', 'my_chat_member'],
    });

    logger.info('Bot is running! Press Ctrl+C to stop.');
  } catch (error) {
    logger.error('Failed to start bot', { error: error.message });
    closeDatabase();
    process.exit(1);
  }
}

main();
