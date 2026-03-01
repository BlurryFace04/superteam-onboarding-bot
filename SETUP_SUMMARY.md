# Setup Summary

## Your Current Configuration

✅ **Bot Token**: Set in `.env`  
✅ **Group ID**: `-5178164012` (set in `.env`)  
✅ **Admin User ID**: `1247134146` (set in `.env`)  
✅ **Mode**: Single Group (INTRO_CHANNEL_ID left blank)

## What You Need to Do Next

### 1. Add the Bot to Your Group

1. Open your Superteam group in Telegram
2. Click the group name → "Administrators" → "Add Administrator"
3. Search for your bot by username
4. Grant these permissions:
   - ✅ **Delete messages** (required)
   - ✅ **Restrict members** (required)
   - All others can be disabled

### 2. Start the Bot

```bash
cd /Users/blurryface/FermiParadox/superteam-my-tgbot
npm start
```

You should see:
```
[INFO] Database initialized
[INFO] Bot connected { username: 'YourBot', id: XXXXXX }
[INFO] Bot is running! Press Ctrl+C to stop.
```

### 3. Test It

1. Have someone (or use a test account) join the group
2. They should:
   - Receive a welcome DM (or in-group message)
   - Be restricted from sending messages
   - Be able to post a 50+ character intro
   - Get unrestricted automatically after intro

## How It Works

```
New user joins → Bot restricts them → Welcome message sent
                                            ↓
User can chat freely ← Bot unrestricts ← User posts intro (50+ chars)
```

## Common Commands

### For Users
- `/help` - See intro format
- `/example` - See example intro
- `/status` - Check intro status

### For You (Admin)
- `/admin_stats` - View statistics
- `/admin_list_pending` - See who hasn't introduced
- `/admin_approve <user_id>` - Manually approve someone
- `/admin_status <user_id>` - Check someone's status

## Files Reference

- **`.env`** - Your configuration (tokens, IDs)
- **`src/index.js`** - Main bot entry point
- **`data/bot.db`** - SQLite database (auto-created)
- **`README.md`** - Full documentation
- **`docs/QUICK_START.md`** - Step-by-step setup guide
- **`docs/GETTING_IDS.md`** - How to get group/channel IDs

## Troubleshooting

**Bot won't start:**
```bash
# Check Node.js version (need 18+)
node --version

# Reinstall dependencies
npm install
```

**Messages not being deleted:**
- Verify bot is admin with "Delete messages" permission
- Check logs for errors

**Users not getting unrestricted:**
- Verify bot has "Restrict members" permission
- Make sure intro is at least 50 characters
- Check logs with: `LOG_LEVEL=debug npm start`

## Production Deployment

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start src/index.js --name superteam-bot
pm2 save
pm2 startup
```

### Using Docker
```bash
docker-compose up -d
docker-compose logs -f
```

## Support

Need help? Check:
1. `README.md` - Full documentation
2. `docs/QUICK_START.md` - Detailed setup guide
3. Bot logs - Run with `LOG_LEVEL=debug`
