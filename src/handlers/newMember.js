import { config } from '../config.js';
import { upsertUser, isUserIntroduced } from '../database.js';
import { messages, formatMention } from '../messages.js';
import { logger } from '../logger.js';

async function sendWelcomeMessage(telegram, user) {
  const userId = user.id;
  const displayName = user.first_name || 'there';
  const userMention = formatMention(userId, displayName, user.username);
  const sendOptions = {};
  if (config.groups.introTopicId) {
    sendOptions.message_thread_id = config.groups.introTopicId;
  }

  logger.info('Attempting to send welcome message', { userId, topicId: config.groups.introTopicId });

  const welcomeText = messages.welcome(userMention);
  
  // Use HTML parse mode for user mentions to work
  try {
    const msg = await telegram.sendMessage(
      config.groups.mainGroupId,
      welcomeText,
      { ...sendOptions, parse_mode: 'HTML' }
    );
    logger.info('Welcome message sent', { userId, messageId: msg.message_id });

    return msg;
  } catch (markdownError) {
    logger.warn('Markdown failed, trying plain text', { error: markdownError.message });
    
    try {
      const plainText = welcomeText.replace(/\*/g, '');
      const msg = await telegram.sendMessage(
        config.groups.mainGroupId,
        plainText,
        sendOptions
      );
      logger.info('Welcome message sent (plain text)', { userId, messageId: msg.message_id });
      return msg;
    } catch (plainError) {
      logger.error('Could not send welcome message at all', { 
        userId, 
        error: plainError.message,
        groupId: config.groups.mainGroupId,
        topicId: config.groups.introTopicId,
      });
      return null;
    }
  }
}

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

      logger.info('New member detected (chat_member)', { 
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

      await sendWelcomeMessage(ctx.telegram, user);

    } catch (error) {
      logger.error('Error handling new member (chat_member)', { error: error.message });
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

        logger.info('New member detected (new_chat_members)', { 
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
          await sendWelcomeMessage(ctx.telegram, user);
        }
      }
    } catch (error) {
      logger.error('Error handling new member (new_chat_members)', { error: error.message });
    }
  });
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
