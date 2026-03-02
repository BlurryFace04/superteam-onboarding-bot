import { config } from '../config.js';
import { getUser, markUserIntroduced, isUserIntroduced, upsertUser } from '../database.js';
import { isValidIntro, validateIntroLength, validateIntroFormat } from '../validation.js';
import { messages, formatMention } from '../messages.js';
import { logger } from '../logger.js';
import { unrestrictUserInMainGroup } from './newMember.js';

function isInIntroTopic(ctx) {
  if (ctx.chat.id !== config.groups.mainGroupId) return false;
  return ctx.message.message_thread_id === config.groups.introTopicId;
}

async function processIntro(ctx, messageText) {
  const user = ctx.from;
  if (!user || user.is_bot) return;

  const chatMember = await ctx.telegram.getChatMember(config.groups.mainGroupId, user.id);
  if (['administrator', 'creator'].includes(chatMember.status)) return;

  if (isUserIntroduced(user.id)) return;

  upsertUser({
    userId: user.id,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
  });

  const displayName = user.first_name || 'there';
  const userMention = formatMention(user.id, displayName, user.username);

  // Ignore bot commands - they shouldn't count as intro attempts
  if (messageText.startsWith('/')) {
    logger.debug('Ignoring bot command in intro topic', { userId: user.id, text: messageText });
    return;
  }

  // No text at all (sticker, photo without caption, etc.)
  if (!messageText || messageText.trim().length === 0) {
    logger.info('Non-text message in intro topic', { userId: user.id });
    try {
      await ctx.reply(
        `Hey ${userMention}! Please write a text introduction — photos, stickers, and media alone don't count.\n\nUse /example to see the format!`,
        { reply_to_message_id: ctx.message.message_id, parse_mode: 'HTML' }
      );
    } catch (e) {
      logger.warn('Could not send media feedback', { error: e.message });
    }
    return;
  }

  logger.info('Potential intro message received', { 
    userId: user.id, 
    username: user.username,
    length: messageText.length 
  });

  // Invalid intro - give specific feedback
  if (!isValidIntro(messageText)) {
    const tooShort = !validateIntroLength(messageText);
    const formatResult = validateIntroFormat(messageText);

    logger.info('Invalid intro', { 
      userId: user.id, 
      length: messageText.length,
      tooShort,
      formatValid: formatResult.valid,
    });

    const formatFields = config.introFormat.map(f => `• ${f}`).join('\n');
    let feedbackText;
    if (tooShort) {
      feedbackText = `Hey ${userMention}! Your intro is too short (${messageText.length}/${config.validation.minIntroLength} characters). Please include:\n\n${formatFields}\n\nUse /example to see a sample intro!`;
    } else {
      feedbackText = `Hey ${userMention}! That doesn't quite look like an introduction. 😅\n\nPlease include something like "I'm..." or "My name is..." and cover:\n\n${formatFields}\n\nUse /example to see a sample intro.`;
    }

    try {
      await ctx.reply(feedbackText, { reply_to_message_id: ctx.message.message_id, parse_mode: 'HTML' });
    } catch (e) {
      logger.warn('Could not send intro feedback', { error: e.message });
    }
    return;
  }

  // Valid intro!
  markUserIntroduced(user.id, ctx.message.message_id);
  logger.info('User marked as introduced', { userId: user.id });

  await unrestrictUserInMainGroup(ctx.telegram, user.id);

  try {
    await ctx.reply(
      `🎉 Welcome aboard, ${userMention}! Thanks for introducing yourself. You can now participate freely in the group!`,
      { reply_to_message_id: ctx.message.message_id, parse_mode: 'HTML' }
    );
  } catch (e) {
    logger.debug('Could not reply with approval', { error: e.message });
  }
}

export function setupIntroDetectionHandler(bot) {
  // Handle new messages in intro topic
  bot.on('message', async (ctx, next) => {
    try {
      if (!isInIntroTopic(ctx)) return next();

      const messageText = ctx.message.text || ctx.message.caption || '';
      await processIntro(ctx, messageText);
    } catch (error) {
      logger.error('Error in intro detection', { error: error.message });
    }
    return next();
  });

  // Handle edited messages - user might fix their intro
  bot.on('edited_message', async (ctx, next) => {
    try {
      const msg = ctx.editedMessage;
      if (!msg) return next();

      if (msg.chat.id !== config.groups.mainGroupId) return next();
      if (msg.message_thread_id !== config.groups.introTopicId) return next();

      const user = msg.from;
      if (!user || user.is_bot) return next();
      if (isUserIntroduced(user.id)) return next();

      const messageText = msg.text || msg.caption || '';
      if (!isValidIntro(messageText)) return next();

      logger.info('Valid intro detected via edit', { userId: user.id, length: messageText.length });

      upsertUser({
        userId: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
      });

      markUserIntroduced(user.id, msg.message_id);
      await unrestrictUserInMainGroup(ctx.telegram, user.id);

      const displayName = user.first_name || 'there';
      const userMention = formatMention(user.id, displayName, user.username);
      try {
        await ctx.telegram.sendMessage(
          config.groups.mainGroupId,
          `🎉 Welcome aboard, ${userMention}! Thanks for introducing yourself. You can now participate freely in the group!`,
          { 
            ...(config.groups.introTopicId ? { message_thread_id: config.groups.introTopicId } : {}),
            parse_mode: 'HTML'
          }
        );
      } catch (e) {
        logger.debug('Could not send approval after edit', { error: e.message });
      }
    } catch (error) {
      logger.error('Error in edited message handler', { error: error.message });
    }
    return next();
  });
}
