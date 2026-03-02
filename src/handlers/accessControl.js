import { config } from '../config.js';
import { getUser, updateLastReminded } from '../database.js';
import { messages } from '../messages.js';
import { logger } from '../logger.js';
import { isValidIntro } from '../validation.js';

export function setupAccessControlHandler(bot) {
  bot.on('message', async (ctx, next) => {
    try {
      if (ctx.chat.id !== config.groups.mainGroupId) {
        return next();
      }

      // Ignore service messages (join/leave notifications, pinned messages, etc.)
      if (ctx.message.left_chat_member || ctx.message.new_chat_members || 
          ctx.message.pinned_message || ctx.message.group_chat_created) {
        return next();
      }

      // If using topics, don't restrict messages in the intro topic
      if (config.groups.introTopicId !== null) {
        const messageTopicId = ctx.message.message_thread_id;
        if (messageTopicId === config.groups.introTopicId) {
          logger.debug('Message in intro topic, skipping access control', { topicId: messageTopicId });
          return next();
        }
      }

      const user = ctx.from;
      if (!user || user.is_bot) {
        return next();
      }

      const chatMember = await ctx.telegram.getChatMember(config.groups.mainGroupId, user.id);
      if (['administrator', 'creator'].includes(chatMember.status)) {
        return next();
      }

      // Check if user exists in database
      const userData = getUser(user.id);
      
      // If user is not in database, they joined before the bot was added
      // Let them through without any restrictions (old members are grandfathered in)
      if (!userData) {
        logger.debug('User not in database (joined before bot), allowing', { userId: user.id });
        return next();
      }

      // User is in database - check if they've introduced themselves
      if (userData.intro_status === 'completed') {
        return next();
      }

      logger.info('Unauthorized message attempt', { 
        userId: user.id, 
        username: user.username 
      });

      if (config.groups.useSingleGroup) {
        const messageText = ctx.message.text || ctx.message.caption || '';
        if (isValidIntro(messageText)) {
          logger.info('Allowing potential intro message through', { userId: user.id });
          return next();
        }
      }

      if (config.behavior.deleteUnauthorizedMessages) {
        try {
          await ctx.deleteMessage();
          logger.info('Deleted unauthorized message', { 
            userId: user.id,
            messageId: ctx.message.message_id 
          });
        } catch (deleteError) {
          logger.warn('Could not delete message', { error: deleteError.message });
        }
      }

      const shouldRemind = shouldSendReminder(userData);

      if (shouldRemind) {
        const userName = user.first_name || user.username || 'there';
        
        try {
          await ctx.telegram.sendMessage(
            user.id,
            messages.introRequired(userName),
            { parse_mode: 'Markdown' }
          );
          updateLastReminded(user.id);
          logger.info('Sent intro reminder DM', { userId: user.id });
        } catch (dmError) {
          logger.debug('Could not DM reminder, trying in-group', { 
            error: dmError.message 
          });
          
          try {
            const reminderOptions = { parse_mode: 'Markdown' };
            if (config.groups.introTopicId) {
              reminderOptions.message_thread_id = config.groups.introTopicId;
            }

            const reminder = await ctx.telegram.sendMessage(
              config.groups.mainGroupId,
              messages.introRequired(userName),
              reminderOptions
            );
            updateLastReminded(user.id);
            
            setTimeout(async () => {
              try {
                await ctx.telegram.deleteMessage(
                  config.groups.mainGroupId, 
                  reminder.message_id
                );
              } catch (e) {}
            }, 30000);
          } catch (e) {
            logger.debug('Could not send in-group reminder', { error: e.message });
          }
        }
      }

    } catch (error) {
      logger.error('Error in access control', { error: error.message });
    }

    return next();
  });
}

function shouldSendReminder(userData) {
  if (!userData) return true;
  
  if (!userData.last_reminded_at) return true;
  
  const lastReminded = new Date(userData.last_reminded_at);
  const now = new Date();
  const hoursSinceReminder = (now - lastReminded) / (1000 * 60 * 60);
  
  const minHoursBetweenReminders = Math.min(config.behavior.reminderIntervalHours, 1);
  
  return hoursSinceReminder >= minHoursBetweenReminders;
}
