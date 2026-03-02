import { Telegraf } from 'telegraf';
import 'dotenv/config';

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('❌ Set BOT_TOKEN in your .env file first');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

console.log('🤖 ID Detector Started');
console.log('='.repeat(60));
console.log('Send a message in your group to get all required IDs.');
console.log('Send it inside a topic to also get the Topic ID.');
console.log('You can also DM the bot to get your Admin User ID.');
console.log('='.repeat(60));

bot.on('message', async (ctx) => {
  const chatId = ctx.chat.id;
  const chatType = ctx.chat.type;
  const chatTitle = ctx.chat.title || 'Private Chat';
  const topicId = ctx.message.message_thread_id || null;
  const userId = ctx.from.id;
  const username = ctx.from.username ? `@${ctx.from.username}` : 'N/A';

  console.log('\n' + '='.repeat(60));
  console.log(`  MAIN_GROUP_ID  =  ${chatId}`);
  if (topicId) {
    console.log(`  INTRO_TOPIC_ID =  ${topicId}`);
  }
  console.log(`  ADMIN_USER_IDS =  ${userId}  (${username})`);
  console.log('='.repeat(60));

  const lines = [
    `📍 *IDs Detected*\n`,
    `*Group ID (MAIN\\_GROUP\\_ID):* \`${chatId}\``,
    `*Chat Type:* ${chatType}`,
    `*Chat Title:* ${chatTitle}`,
  ];

  if (topicId) {
    lines.push(`*Topic ID (INTRO\\_TOPIC\\_ID):* \`${topicId}\``);
  } else if (chatType !== 'private') {
    lines.push(`\n⚠️ No topic detected — send a message *inside a topic* to get the Topic ID.`);
  }

  lines.push(`\n*Your User ID (ADMIN\\_USER\\_IDS):* \`${userId}\``);
  lines.push(`*Your Username:* ${username}`);

  try {
    await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply(lines.join('\n').replace(/[*`\\_]/g, ''));
  }
});

bot.launch();

console.log('\nPress Ctrl+C to stop.\n');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
