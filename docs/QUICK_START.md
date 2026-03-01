# Quick Start Guide - Single Group Setup

This is the simplest way to set up the bot. Users post their intros in the same group where they want to chat.

## Prerequisites

1. A Telegram bot token from [@BotFather](https://t.me/BotFather)
2. Admin access to your Superteam group
3. Node.js 18+ installed (or Docker)

## Step-by-Step Setup

### 1. Get Your Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` 
3. Follow the prompts to create your bot
4. Copy the bot token (looks like `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Get Your Group ID

1. Add [@RawDataBot](https://t.me/rawdatabot) to your Superteam group
2. Send any message in the group
3. RawDataBot will reply with: "Your chat ID is -XXXXXXXXX"
4. Copy that chat ID (it's negative, e.g., `-5178164012`)
5. Remove @RawDataBot from the group

### 3. Get Your User ID (for admin commands)

1. Send a private message to [@RawDataBot](https://t.me/rawdatabot)
2. It will reply with: "Your ID is XXXXXXXXX"
3. Copy your user ID (it's positive, e.g., `1247134146`)

### 4. Install the Bot

```bash
# Clone or download the bot code
cd superteam-my-tgbot

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 5. Configure .env File

Edit the `.env` file with your actual values:

```env
# Replace with your bot token from step 1
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Replace with your group ID from step 2
MAIN_GROUP_ID=-5178164012

# Leave this blank for single-group mode
INTRO_CHANNEL_ID=

# Replace with your user ID from step 3
ADMIN_USER_IDS=1247134146

# These are good defaults
DELETE_UNAUTHORIZED_MESSAGES=true
MIN_INTRO_LENGTH=50
REMINDER_INTERVAL_HOURS=24
```

### 6. Add Bot to Your Group

1. Add your bot to the Superteam group
2. **Make it an admin** with these permissions:
   - ✅ Delete messages
   - ✅ Restrict members
   - ✅ (All other permissions can be off)

### 7. Start the Bot

```bash
npm start
```

You should see:
```
[timestamp] [INFO] Bot connected { username: 'YourBotName', id: 1234567890 }
[timestamp] [INFO] Bot is running! Press Ctrl+C to stop.
```

## Testing

1. Leave and rejoin your group with a test account
2. Bot should send you a welcome message
3. Try to send a normal message - it should be deleted
4. Post an introduction (at least 50 characters)
5. Bot should unrestrict you and welcome you

## Example Introduction

```
Hey everyone! I'm Alex 👋

📍 Based in Singapore
🧑‍💻 Building a DeFi protocol on Solana
🎯 Fun fact: I taught myself to code during the pandemic
🤝 Looking to contribute by sharing technical insights and connecting with other builders!
```

## Common Issues

**Bot doesn't respond:**
- Check the bot is running (`npm start`)
- Verify the bot token is correct
- Make sure the group ID is correct and negative

**Messages not deleted:**
- Bot needs "Delete messages" permission
- Check bot is an admin

**Users not unrestricted after intro:**
- Bot needs "Restrict members" permission
- Intro must be at least 50 characters
- Check bot logs for errors

## Admin Commands

Once set up, you can use:

- `/admin_stats` - See bot statistics
- `/admin_list_pending` - List users who haven't introduced
- `/admin_approve <user_id>` - Manually approve someone
- `/admin_status <user_id>` - Check someone's status

## Docker Setup (Alternative)

If you prefer Docker:

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Need Help?

Check the main [README.md](../README.md) for:
- Troubleshooting guide
- Full configuration options
- Two-group setup instructions
- Deployment tips
