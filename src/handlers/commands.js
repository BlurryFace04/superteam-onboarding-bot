import { config } from '../config.js';
import { messages } from '../messages.js';
import { 
  getUser, 
  isUserIntroduced, 
  resetUserIntro, 
  manuallyApproveUser,
  getPendingUsers,
  getStats,
  upsertUser,
  resetDatabase
} from '../database.js';
import { logger } from '../logger.js';
import { unrestrictUserInMainGroup } from './newMember.js';

export function setupCommandHandlers(bot) {
  bot.command('start', async (ctx) => {
    const user = ctx.from;
    const userName = user.first_name || user.username || 'there';
    
    upsertUser({
      userId: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
    });

    await ctx.reply(messages.welcome(userName), { parse_mode: 'Markdown' });
  });

  bot.command('help', async (ctx) => {
    await ctx.reply(messages.help(), { parse_mode: 'Markdown' });
  });

  bot.command('example', async (ctx) => {
    await ctx.reply(messages.example, { parse_mode: 'Markdown' });
  });

  bot.command('status', async (ctx) => {
    const userId = ctx.from.id;
    const introduced = isUserIntroduced(userId);
    
    if (introduced) {
      await ctx.reply(messages.status.introduced, { parse_mode: 'Markdown' });
    } else {
      await ctx.reply(messages.status.pending(), { parse_mode: 'Markdown' });
    }
  });

  setupAdminCommands(bot);
}

function isAdmin(userId) {
  return config.admin.userIds.includes(userId);
}

function setupAdminCommands(bot) {
  bot.command('admin_help', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.reply(messages.admin.notAuthorized);
      return;
    }
    
    await ctx.reply(messages.admin.help, { parse_mode: 'Markdown' });
  });

  bot.command('admin_reset', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.reply(messages.admin.notAuthorized);
      return;
    }

    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
      await ctx.reply('Usage: /admin_reset <user_id>');
      return;
    }

    const targetUserId = parseInt(args[1], 10);
    if (isNaN(targetUserId)) {
      await ctx.reply(messages.admin.invalidUserId);
      return;
    }

    const user = getUser(targetUserId);
    if (!user) {
      await ctx.reply(messages.admin.userNotFound(targetUserId));
      return;
    }

    resetUserIntro(targetUserId);
    logger.info('Admin reset user intro', { 
      adminId: ctx.from.id, 
      targetUserId 
    });

    try {
      await ctx.telegram.restrictChatMember(
        config.groups.mainGroupId,
        targetUserId,
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
    } catch (e) {
      logger.debug('Could not restrict user after reset', { error: e.message });
    }

    await ctx.reply(messages.admin.userReset(targetUserId));
  });

  bot.command('admin_approve', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.reply(messages.admin.notAuthorized);
      return;
    }

    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
      await ctx.reply('Usage: /admin_approve <user_id>');
      return;
    }

    const targetUserId = parseInt(args[1], 10);
    if (isNaN(targetUserId)) {
      await ctx.reply(messages.admin.invalidUserId);
      return;
    }

    upsertUser({
      userId: targetUserId,
      username: null,
      firstName: null,
      lastName: null,
    });

    manuallyApproveUser(targetUserId);
    await unrestrictUserInMainGroup(ctx.telegram, targetUserId);
    
    logger.info('Admin manually approved user', { 
      adminId: ctx.from.id, 
      targetUserId 
    });

    await ctx.reply(messages.admin.userApproved(targetUserId));
  });

  bot.command('admin_status', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.reply(messages.admin.notAuthorized);
      return;
    }

    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
      await ctx.reply('Usage: /admin_status <user_id>');
      return;
    }

    const targetUserId = parseInt(args[1], 10);
    if (isNaN(targetUserId)) {
      await ctx.reply(messages.admin.invalidUserId);
      return;
    }

    const user = getUser(targetUserId);
    if (!user) {
      await ctx.reply(messages.admin.userNotFound(targetUserId));
      return;
    }

    const statusMsg = `📊 *User Status*

ID: \`${user.user_id}\`
Username: ${user.username ? '@' + user.username : 'N/A'}
Name: ${user.first_name || 'N/A'} ${user.last_name || ''}
Status: ${user.intro_status === 'completed' ? '✅ Introduced' : '⏳ Pending'}
Manually Approved: ${user.manually_approved ? 'Yes' : 'No'}
Joined: ${user.joined_at || 'N/A'}
Intro Completed: ${user.intro_completed_at || 'N/A'}
Last Reminded: ${user.last_reminded_at || 'N/A'}`;

    await ctx.reply(statusMsg, { parse_mode: 'Markdown' });
  });

  bot.command('admin_stats', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.reply(messages.admin.notAuthorized);
      return;
    }

    const stats = getStats();

    const statsMsg = `📈 *Bot Statistics*

Total Users: ${stats.total}
✅ Introduced: ${stats.completed}
⏳ Pending: ${stats.pending}
🔧 Manually Approved: ${stats.manuallyApproved}

Completion Rate: ${stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}%`;

    await ctx.reply(statsMsg, { parse_mode: 'Markdown' });
  });

  bot.command('admin_list_pending', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
      await ctx.reply(messages.admin.notAuthorized);
      return;
    }

    const pending = getPendingUsers();

    if (pending.length === 0) {
      await ctx.reply('✅ No pending users!');
      return;
    }

    const userList = pending.slice(0, 20).map((u, i) => {
      const name = u.first_name || u.username || 'Unknown';
      const username = u.username ? `@${u.username}` : '';
      return `${i + 1}. ${name} ${username} (ID: \`${u.user_id}\`)`;
    }).join('\n');

    const msg = `⏳ *Pending Users* (${pending.length} total)\n\n${userList}${pending.length > 20 ? `\n\n...and ${pending.length - 20} more` : ''}`;

    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  bot.command('admin_reset_db', async (ctx) => {
    const userId = ctx.from.id;

    if (!config.admin.userIds.includes(userId)) {
      await ctx.reply(messages.admin.notAuthorized);
      return;
    }

    try {
      const deletedCount = resetDatabase();
      logger.warn('Database reset by admin', { adminId: userId, deletedUsers: deletedCount });
      await ctx.reply(`🗑️ Database reset complete. Deleted ${deletedCount} user(s).`);
    } catch (error) {
      logger.error('Failed to reset database', { error: error.message });
      await ctx.reply(`❌ Failed to reset database: ${error.message}`);
    }
  });
}
