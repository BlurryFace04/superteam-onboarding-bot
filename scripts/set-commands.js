import { Telegraf } from 'telegraf';
import 'dotenv/config';

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('❌ Set BOT_TOKEN in .env first');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

const commands = [
  { command: 'start', description: 'Get started with your introduction' },
  { command: 'help', description: 'Show help message' },
  { command: 'example', description: 'See an example introduction' },
  { command: 'status', description: 'Check your introduction status' },
  { command: 'id', description: 'Show group ID, topic ID, and your user ID' },
];

const adminCommands = [
  { command: 'admin_help', description: 'Show admin commands' },
  { command: 'admin_reset', description: 'Reset a user\'s intro status' },
  { command: 'admin_approve', description: 'Manually approve a user' },
  { command: 'admin_status', description: 'Check a user\'s status' },
  { command: 'admin_stats', description: 'View bot statistics' },
  { command: 'admin_list_pending', description: 'List users pending intro' },
  { command: 'admin_reset_db', description: 'Reset entire database' },
];

async function setCommands() {
  try {
    // Set regular commands
    await bot.telegram.setMyCommands(commands);
    console.log('✅ Regular commands set successfully');
    
    // Set admin commands (shown to admins only - requires admin IDs from config)
    await bot.telegram.setMyCommands([...commands, ...adminCommands]);
    console.log('✅ Admin commands registered');
    
    console.log('\n📋 Commands registered:');
    commands.forEach(cmd => console.log(`  /${cmd.command} - ${cmd.description}`));
    console.log('\n🔧 Admin commands:');
    adminCommands.forEach(cmd => console.log(`  /${cmd.command} - ${cmd.description}`));
    
  } catch (error) {
    console.error('❌ Failed to set commands:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

setCommands();
