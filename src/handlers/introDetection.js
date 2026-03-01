import { config } from '../config.js';
import { getUser, markUserIntroduced, isUserIntroduced, upsertUser } from '../database.js';
import { isValidIntro, getIntroFeedback } from '../validation.js';
import { messages } from '../messages.js';
import { logger } from '../logger.js';
import { unrestrictUserInMainGroup } from './newMember.js';

export function setupIntroDetectionHandler(bot) {
  bot.on('message', async (ctx, next) => {
    try {
      if (ctx.chat.id !== config.groups.introChannelId) {
        return next();
      }

      // If using topics, only process messages in the intro topic
      if (config.groups.introTopicId !== null) {
        const messageTopicId = ctx.message.message_thread_id;
        if (messageTopicId !== config.groups.introTopicId) {
          return next();
        }
        logger.debug('Message in intro topic', { userId: ctx.from.id, topicId: messageTopicId });
      }

      const user = ctx.from;
      if (!user || user.is_bot) {
        return next();
      }

      const chatMember = await ctx.telegram.getChatMember(config.groups.mainGroupId, user.id);
      if (['administrator', 'creator'].includes(chatMember.status)) {
        return next();
      }

      if (isUserIntroduced(user.id)) {
        return next();
      }

      upsertUser({
        userId: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
      });

      const messageText = ctx.message.text || ctx.message.caption || '';
      
      logger.info('Potential intro message received', { 
        userId: user.id, 
        username: user.username,
        length: messageText.length 
      });

      if (!isValidIntro(messageText)) {
        logger.info('Message too short or invalid for intro', { userId: user.id });
        
        const feedback = getIntroFeedback(messageText);
        if (feedback && config.validation.enableFormatValidation) {
          try {
            const feedbackMsg = `Hey ${user.first_name || 'there'}! Your intro is a great start, but here are some suggestions:\n\n${feedback.map(f => `• ${f}`).join('\n')}\n\nFeel free to add more details!`;
            
            await ctx.reply(feedbackMsg, {
              reply_to_message_id: ctx.message.message_id,
            });
          } catch (e) {
            logger.debug('Could not send feedback', { error: e.message });
          }
        }
        
        return next();
      }

      markUserIntroduced(user.id, ctx.message.message_id);
      logger.info('User marked as introduced', { userId: user.id });

      const unrestricted = await unrestrictUserInMainGroup(ctx.telegram, user.id);

      const userName = user.first_name || user.username || 'there';
      
      if (config.groups.useSingleGroup && unrestricted) {
        try {
          await ctx.reply(
            `🎉 Welcome aboard, ${userName}! Thanks for introducing yourself. You can now participate freely in the group!`,
            { reply_to_message_id: ctx.message.message_id }
          );
        } catch (e) {
          logger.debug('Could not reply in group', { error: e.message });
        }
      } else {
        try {
          await ctx.telegram.sendMessage(
            user.id,
            messages.introCompleted(userName),
            { parse_mode: 'Markdown' }
          );
        } catch (dmError) {
          logger.debug('Could not DM intro completion', { error: dmError.message });
        }
      }

    } catch (error) {
      logger.error('Error in intro detection', { error: error.message });
    }
    
    return next();
  });
}

export async function checkExistingIntro(telegram, userId) {
  try {
    return isUserIntroduced(userId);
  } catch (error) {
    logger.error('Error checking existing intro', { error: error.message });
    return false;
  }
}
