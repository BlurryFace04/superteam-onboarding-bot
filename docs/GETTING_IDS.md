# Getting Group and Channel IDs

This guide explains multiple methods to find your Telegram group and channel IDs.

## Quick Methods

### Method 1: Using @userinfobot (Recommended)

1. Open Telegram and search for [@userinfobot](https://t.me/userinfobot)
2. Add the bot to your group/channel as admin
3. Send any message in the group
4. The bot replies instantly with the chat ID
5. Copy the ID (looks like `-100XXXXXXXXXX`)
6. Remove the bot after getting the ID

**Alternative bots:**
- [@getidsbot](https://t.me/getidsbot)
- [@RawDataBot](https://t.me/rawdatabot)
- [@myidbot](https://t.me/myidbot)

### Method 2: Forward Message Trick

1. Forward any message from your group to [@userinfobot](https://t.me/userinfobot)
2. The bot shows "Forwarded from chat" with the chat ID
3. Copy the ID

### Method 3: Web Telegram

1. Open [web.telegram.org](https://web.telegram.org)
2. Go to your group/channel
3. Look at the URL: `https://web.telegram.org/k/#-1001234567890`
4. The number after `#` is your chat ID

### Method 4: Using the Get-IDs Script (Most Reliable)

We've included a helper script in this project:

1. Get your bot token from [@BotFather](https://t.me/BotFather)
2. Run the script:

```bash
# Edit the script with your bot token
nano scripts/get-ids.js

# Run it
node scripts/get-ids.js
```

3. Add your bot to the group/channel
4. Send any message - the bot will reply with all IDs
5. Copy the Chat ID values

## Important Notes

### Group/Channel ID Format

- **Supergroups**: Start with `-100`, e.g., `-1001234567890`
- **Regular groups**: Negative number, e.g., `-123456789`
- **Channels**: Start with `-100`, e.g., `-1001234567890`
- **Private chats**: Positive number (not relevant here)

### For Channels

If your intro channel is a **channel** (not group):
1. Make it public temporarily, or
2. Use Method 4 (the script) by adding your bot as admin
3. Forward a message to @userinfobot

### Getting Your Admin User ID

To configure admin commands, you also need your Telegram user ID:

1. Message [@userinfobot](https://t.me/userinfobot) directly
2. It shows your user ID (positive number)
3. Add this to `ADMIN_USER_IDS` in `.env`

## Example Configuration

Once you have the IDs, your `.env` should look like:

```env
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
MAIN_GROUP_ID=-1001234567890
INTRO_CHANNEL_ID=-1009876543210
ADMIN_USER_IDS=123456789,987654321
```

## Troubleshooting

**"Bot can't read messages"**
- Make sure the bot is added as admin
- Check "Privacy Mode" is disabled in BotFather settings

**"Wrong chat ID"**
- Group IDs are always negative
- Supergroup IDs always start with `-100`
- Don't forget the minus sign!

**"Bot doesn't respond to script"**
- Make sure you replaced `YOUR_BOT_TOKEN_HERE`
- Check the bot token is correct
- Verify the bot has permission to read messages
