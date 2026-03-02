import { config } from './config.js';

/**
 * Format a user mention that works for all users (with or without username)
 * Uses HTML format: <a href="tg://user?id=123">Name</a>
 */
export function formatMention(userId, displayName, username) {
  if (username) {
    return `@${username}`;
  }
  return `<a href="tg://user?id=${userId}">${displayName}</a>`;
}

export const messages = {
  welcome: (userMention) => {
    const introLocation = config.groups.introTopicId 
      ? 'in the 👋 Introductions topic' 
      : 'right here in this group';
    
    return `👋 Welcome to Superteam MY, ${userMention}!

To get started, please introduce yourself ${introLocation} using this format 👇

This helps everyone get context and makes collaboration easier.

━━━━━━━━━━━━━━━━━━━━━━
📝 <b>Intro format:</b>

• Who are you & what do you do?
• Where are you based?
• One fun fact about you
• How are you looking to contribute to Superteam MY?

━━━━━━━━━━━━━━━━━━━━━━

No pressure to be perfect — just be you!

👉 Once you've posted your intro, you'll be able to participate fully in the group.

Use /example to see a sample introduction.`;
  },

  example: `✨ *Example intro*

Hey everyone! I'm Marianne 👋  

Together with Han, we are Co-Leads of Superteam Malaysia!

📍 Based in Kuala Lumpur and Network School  
🧑‍🎓 Fun fact: My first Solana project was building an AI Telegram trading bot, and that's how I found myself in Superteam MY!  
🤝 Looking to contribute by:

• Connecting builders with the right mentors, partners, and opportunities  
• Helping teams refine their story, demos, and go-to-market  
• Supporting members who want to go from "building quietly" → "shipping publicly"

Excited to build alongside all of you — feel free to reach out anytime 🙌`,

  introRequired: (userMention) => {
    const introLocation = config.groups.introTopicId
      ? 'in the 👋 Introductions topic'
      : 'in the group';

    return `Hey ${userMention}! 👋

Please introduce yourself ${introLocation} first before participating.

This helps everyone know who you are and how to collaborate with you!

Use /help to see the intro format or /example to see a sample.`;
  },

  introCompleted: (userMention) => `🎉 Thanks for introducing yourself, ${userMention}!

You can now fully participate in the Superteam MY group. Welcome aboard!`,

  alreadyIntroduced: `You've already introduced yourself! Feel free to participate in the group.`,

  reminderDM: (userMention) => `Hey ${userMention}! 👋

Just a friendly reminder — you haven't introduced yourself yet.

Once you do, you'll be able to participate fully in Superteam MY!

Use /help to see the intro format, or /example to see a sample intro.`,

  help: () => {
    const introLocation = config.groups.introTopicId
      ? 'in the 👋 Introductions topic'
      : 'in this group';
    
    return `🤖 *Superteam MY Intro Bot*

I help ensure all community members introduce themselves, making collaboration easier for everyone.

*Commands:*
/start - Get started with your introduction
/help - Show this help message
/example - See an example introduction
/status - Check your introduction status

*How it works:*
1. Post your introduction ${introLocation} (at least 50 characters)
2. Once verified, you can participate freely
3. That's it! 🎉`;
  },

  status: {
    introduced: `✅ You're all set! You've already introduced yourself and can participate freely.`,
    pending: () => {
      const introLocation = config.groups.introTopicId
        ? 'in the 👋 Introductions topic'
        : 'in this group';
      return `⏳ You haven't introduced yourself yet. Please post your intro ${introLocation} to participate fully.`;
    },
  },

  admin: {
    help: `🔧 *Admin Commands*

/admin_reset <user_id> - Reset a user's intro status
/admin_approve <user_id> - Manually approve a user
/admin_status <user_id> - Check a user's status
/admin_stats - View bot statistics
/admin_list_pending - List users pending intro
/admin_reset_db - ⚠️ Reset entire database (deletes all users)`,

    userReset: (userId) => `✅ User ${userId}'s intro status has been reset.`,
    userApproved: (userId) => `✅ User ${userId} has been manually approved.`,
    userNotFound: (userId) => `❌ User ${userId} not found in database.`,
    notAuthorized: `❌ You are not authorized to use admin commands.`,
    invalidUserId: `❌ Invalid user ID. Please provide a numeric user ID.`,
  },

  errors: {
    generic: `Something went wrong. Please try again later.`,
    botNotAdmin: `⚠️ I need admin privileges in this group to manage member permissions.`,
  },
};

export default messages;
