import { Telegraf } from 'telegraf';
import 'dotenv/config';

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('❌ Set BOT_TOKEN in .env first');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

console.log('🤖 Topic ID Detector Started!');
console.log('='.repeat(60));
console.log('Instructions:');
console.log('1. Make sure Topics are enabled in your group');
console.log('2. Send any message in a topic');
console.log('3. I will show you the topic ID');
console.log('='.repeat(60));

bot.on('message', async (ctx) => {
  const chatId = ctx.chat.id;
  const topicId = ctx.message.message_thread_id;
  const chatTitle = ctx.chat.title || 'N/A';
  const messageText = ctx.message.text || '[media]';

  console.log('\n📍 Message Received:');
  console.log('='.repeat(60));
  console.log(`Chat ID: ${chatId}`);
  console.log(`Chat Title: ${chatTitle}`);
  
  if (topicId) {
    console.log(`✅ Topic ID: ${topicId}`);
    console.log('='.repeat(60));
    
    await ctx.reply(
      `📍 *Topic Information*\n\n` +
      `Chat ID: \`${chatId}\`\n` +
      `Topic ID: \`${topicId}\`\n\n` +
      `Use this Topic ID in your .env file!`,
      { parse_mode: 'Markdown' }
    );
  } else {
    console.log('⚠️  No Topic ID (this is the general chat)');
    console.log('='.repeat(60));
    
    await ctx.reply(
      `⚠️ This message is not in a topic.\n\n` +
      `To get a topic ID:\n` +
      `1. Enable Topics in group settings\n` +
      `2. Create a topic (e.g., "Introductions")\n` +
      `3. Send a message inside that topic`,
      { parse_mode: 'Markdown' }
    );
  }
});

bot.launch();

console.log('\n✅ Bot is running! Send a message in a topic to see its ID.');
console.log('Press Ctrl+C to stop.\n');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
