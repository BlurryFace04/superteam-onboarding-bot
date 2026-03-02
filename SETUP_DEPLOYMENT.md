# Setup & Deployment Instructions

This bot runs in a Telegram supergroup using an `Introductions` topic.

## 1) Prerequisites

- Node.js 18+
- Telegram bot token from [@BotFather](https://t.me/BotFather)
- A Telegram supergroup with Topics enabled
- Bot added as admin in the group

Required bot permissions:
- Delete messages
- Restrict members
- Pin messages

## 2) Get Required IDs

**Option A — Bot command:** Start the bot and send `/id` inside your Introductions topic

**Option B — Script:** Run `node scripts/get-ids.js` and send a message in the topic

Both return:
   - `MAIN_GROUP_ID` — your group ID
   - `INTRO_TOPIC_ID` — the topic ID
   - `ADMIN_USER_IDS` — your user ID
4. Copy these values into your `.env` file

## 3) Local Setup

```bash
npm install
cp .env.example .env
```

Update `.env`:
```env
BOT_TOKEN=your_bot_token_here
MAIN_GROUP_ID=-100xxxxxxxxxx
INTRO_TOPIC_ID=12
ADMIN_USER_IDS=123456789

DELETE_UNAUTHORIZED_MESSAGES=true
REMINDER_INTERVAL_HOURS=24
MIN_INTRO_LENGTH=50
ENABLE_FORMAT_VALIDATION=true
INTRO_FORMAT=
DATABASE_PATH=./data/bot.db
LOG_LEVEL=info
```

## 4) Run

```bash
npm start
```

Expected startup logs include:
- `Database initialized`
- `Bot connected`
- `Bot is running!`

## 5) Quick Test Plan

1. Join group with a test account
2. Bot sends welcome message in intro topic and pins it
3. Try posting in non-intro topic before intro -> message should be deleted
4. Post valid intro in intro topic (50+ chars, intro keywords if enabled)
5. Bot approves user and user can message normally

## 6) Deploy

### Railway (recommended)
1. Push repo to GitHub
2. Create Railway project from the repo
3. Set service env vars:
   - `BOT_TOKEN`
   - `MAIN_GROUP_ID`
   - `INTRO_TOPIC_ID`
   - `ADMIN_USER_IDS` (optional but recommended)
4. Add volume mounted at `/app/data` for SQLite persistence
5. Deploy and check logs

### Docker
```bash
docker compose up -d
docker compose logs -f
```

## 7) Useful Commands

User:
- `/help`
- `/example`
- `/status`

Admin:
- `/admin_help`
- `/admin_reset @username`
- `/admin_approve @username`
- `/admin_status @username`
- `/admin_stats`
- `/admin_list_pending`
- `/admin_reset_db`

