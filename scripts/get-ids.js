import { Telegraf } from 'telegraf';

import 'dotenv/config';

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('❌ Set BOT_TOKEN in .env first');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

bot.on('message', async (ctx) => {
  const chatInfo = {
    chatId: ctx.chat.id,
    chatType: ctx.chat.type,
    chatTitle: ctx.chat.title || 'N/A',
    userId: ctx.from.id,
    username: ctx.from.username || 'N/A',
    firstName: ctx.from.first_name,
  };

  console.log('\n📍 Chat Information:');
  console.log('='.repeat(50));
  console.log(`Chat ID: ${chatInfo.chatId}`);
  console.log(`Chat Type: ${chatInfo.chatType}`);
  console.log(`Chat Title: ${chatInfo.chatTitle}`);
  console.log(`Your User ID: ${chatInfo.userId}`);
  console.log(`Your Username: @${chatInfo.username}`);
  console.log('='.repeat(50));

  await ctx.reply(
    `📍 *Chat Information*\n\n` +
    `Chat ID: \`${chatInfo.chatId}\`\n` +
    `Chat Type: ${chatInfo.chatType}\n` +
    `Chat Title: ${chatInfo.chatTitle}\n\n` +
    `Your User ID: \`${chatInfo.userId}\`\n` +
    `Your Username: @${chatInfo.username}`,
    { parse_mode: 'Markdown' }
  );
});

bot.launch();

console.log('🤖 Bot is running! Send a message in your group to get the new ID.');
console.log('Press Ctrl+C to stop.');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
