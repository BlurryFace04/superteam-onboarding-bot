import { config } from '../config.js';
import { upsertUser, isUserIntroduced } from '../database.js';
import { messages } from '../messages.js';
import { logger } from '../logger.js';

export function setupNewMemberHandler(bot) {
  bot.on('chat_member', async (ctx) => {
    try {
      const update = ctx.chatMember;
      
      if (update.chat.id !== config.groups.mainGroupId) {
        return;
      }

      const oldStatus = update.old_chat_member.status;
      const newStatus = update.new_chat_member.status;
      const user = update.new_chat_member.user;

      const isNewMember = 
        (oldStatus === 'left' || oldStatus === 'kicked') &&
        (newStatus === 'member' || newStatus === 'restricted');

      if (!isNewMember) {
        return;
      }

      if (user.is_bot) {
        logger.debug('Ignoring bot join', { userId: user.id });
        return;
      }

      logger.info('New member detected', { 
        userId: user.id, 
        username: user.username,
        firstName: user.first_name 
      });

      upsertUser({
        userId: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
      });

      if (isUserIntroduced(user.id)) {
        logger.info('Returning member already introduced', { userId: user.id });
        return;
      }

      // In single-group mode, don't restrict - we'll delete non-intro messages instead
      // This allows users to post their intro in the same group
      if (!config.groups.useSingleGroup) {
        await restrictUserInMainGroup(ctx, user.id);
      }

      const userName = user.first_name || user.username || 'there';
      
      try {
        await ctx.telegram.sendMessage(
          user.id,
          messages.welcome(userName),
          { parse_mode: 'Markdown' }
        );
        logger.info('Welcome DM sent', { userId: user.id });
      } catch (dmError) {
        logger.warn('Could not send DM, sending in-group message', { 
          userId: user.id, 
          error: dmError.message 
        });
        
        try {
          const sendOptions = { parse_mode: 'Markdown' };
          if (config.groups.introTopicId) {
            sendOptions.message_thread_id = config.groups.introTopicId;
          }

          const msg = await ctx.telegram.sendMessage(
            config.groups.mainGroupId,
            messages.welcome(userName),
            sendOptions
          );
          logger.info('Welcome message sent in group', { 
            userId: user.id, 
            messageId: msg.message_id,
            topicId: config.groups.introTopicId || 'none',
          });
          
          // Keep the message for 5 minutes so user can read it
          setTimeout(async () => {
            try {
              await ctx.telegram.deleteMessage(config.groups.mainGroupId, msg.message_id);
            } catch (e) {
              logger.debug('Could not delete welcome message', { error: e.message });
            }
          }, 300000);
        } catch (groupError) {
          logger.error('Could not send welcome message', { error: groupError.message });
        }
      }

    } catch (error) {
      logger.error('Error handling new member', { error: error.message });
    }
  });

  bot.on('new_chat_members', async (ctx) => {
    try {
      if (ctx.chat.id !== config.groups.mainGroupId) {
        return;
      }

      const newMembers = ctx.message.new_chat_members;

      for (const user of newMembers) {
        if (user.is_bot) continue;

        logger.info('New member via new_chat_members', { 
          userId: user.id, 
          username: user.username 
        });

        upsertUser({
          userId: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
        });

        if (!isUserIntroduced(user.id)) {
          // In single-group mode, don't restrict - we'll delete non-intro messages instead
          if (!config.groups.useSingleGroup) {
            await restrictUserInMainGroup(ctx, user.id);
          }
          
          const userName = user.first_name || user.username || 'there';
          
          try {
            await ctx.telegram.sendMessage(
              user.id,
              messages.welcome(userName),
              { parse_mode: 'Markdown' }
            );
          } catch (e) {
            logger.debug('Could not DM user from new_chat_members', { 
              userId: user.id, 
              error: e.message 
            });
          }
        }
      }
    } catch (error) {
      logger.error('Error in new_chat_members handler', { error: error.message });
    }
  });
}

async function restrictUserInMainGroup(ctx, userId) {
  try {
    await ctx.telegram.restrictChatMember(
      config.groups.mainGroupId,
      userId,
      {
        permissions: {
          can_send_messages: false,
          can_send_audios: false,
          can_send_documents: false,
          can_send_photos: false,
          can_send_videos: false,
          can_send_video_notes: false,
          can_send_voice_notes: false,
          can_send_polls: false,
          can_send_other_messages: false,
          can_add_web_page_previews: false,
          can_change_info: false,
          can_invite_users: true,
          can_pin_messages: false,
          can_manage_topics: false,
        },
      }
    );
    logger.info('User restricted in main group', { userId });
  } catch (error) {
    logger.error('Failed to restrict user', { userId, error: error.message });
  }
}

export async function unrestrictUserInMainGroup(telegram, userId) {
  try {
    await telegram.restrictChatMember(
      config.groups.mainGroupId,
      userId,
      {
        permissions: {
          can_send_messages: true,
          can_send_audios: true,
          can_send_documents: true,
          can_send_photos: true,
          can_send_videos: true,
          can_send_video_notes: true,
          can_send_voice_notes: true,
          can_send_polls: true,
          can_send_other_messages: true,
          can_add_web_page_previews: true,
          can_change_info: false,
          can_invite_users: true,
          can_pin_messages: false,
          can_manage_topics: false,
        },
      }
    );
    logger.info('User unrestricted in main group', { userId });
    return true;
  } catch (error) {
    logger.error('Failed to unrestrict user', { userId, error: error.message });
    return false;
  }
}
