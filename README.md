# Superteam Intro Gatekeeper Bot

**Bot:** [@SuperteamOnboardingBot](https://t.me/SuperteamOnboardingBot)

A Telegram bot that ensures new members introduce themselves before participating in the Superteam MY group.

## Setup & Deployment Guide

For full setup and deployment steps, see [`SETUP_DEPLOYMENT.md`](./SETUP_DEPLOYMENT.md).

## Features

### Core Functionality
- **New Member Detection**: Automatically detects when users join the group via `chat_member` and `new_chat_members` events
- **Welcome Messages**: Sends personalized welcome message with intro format guidelines, tagging the user with `@username`
- **Intro Verification**: Monitors the intro topic/channel for valid introductions with configurable validation
- **Access Control**: Auto-deletes messages from non-introduced users and reminds them to introduce themselves
- **Auto-unrestrict**: Grants full permissions once a valid intro is posted
- **Auto-pin**: Pins the welcome message in the intro topic for visibility

### Setup Modes
- **Topics Mode** (Recommended): Uses a dedicated Introductions topic within the same supergroup

### Admin Features
| Command | Description |
|---------|-------------|
| `/admin_help` | Show admin commands |
| `/admin_reset @username` | Reset a user's intro status |
| `/admin_approve @username` | Manually approve a user |
| `/admin_status @username` | View user's detailed status |
| `/admin_stats` | View bot statistics |
| `/admin_list_pending` | List users awaiting intro |
| `/admin_reset_db` | Reset entire database |

### Bonus Features
- **Persistent storage**: SQLite database with Railway volume support
- **Configurable intro format**: Customize intro fields via `INTRO_FORMAT` env var
- **Auto-pin intro message**: Welcome message is pinned in the intro topic
- **Heuristic validation**: Optional keyword-based validation to ensure intros are genuine
- **User tagging**: All bot messages mention users with clickable `@username` or name links
- **Graceful edge case handling**: Leave & rejoin, deleted intro, edited messages, media-only messages, service messages

## Quick Start

### Prerequisites
- Node.js 18+
- A Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Admin access to your Telegram group (must be a Supergroup with Topics enabled)

### 1. Create Your Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow the prompts
3. Copy the bot token

### 2. Get Group, Topic & Admin IDs

**Option A — Bot command:** Send `/id` inside your Introductions topic (requires bot to be running)

**Option B — Script:** Run `node scripts/get-ids.js` and send a message in the topic

Both will return your **Group ID**, **Topic ID**, and **Admin User ID**. Copy these values into your `.env`.

### 3. Configure Bot Permissions

Add the bot as an **admin** in your group with these permissions:
- **Delete messages**
- **Restrict members**
- **Pin messages**

### 4. Installation

```bash
git clone https://github.com/BlurryFace04/superteam-onboarding-bot.git
cd superteam-onboarding-bot
npm install
cp .env.example .env
```

### 5. Configuration

Edit `.env` with your settings:

```env
BOT_TOKEN=your_bot_token_here
MAIN_GROUP_ID=-100xxxxxxxxxx
INTRO_TOPIC_ID=12

# Optional
DELETE_UNAUTHORIZED_MESSAGES=true
MIN_INTRO_LENGTH=50
ENABLE_FORMAT_VALIDATION=true
ADMIN_USER_IDS=123456789
```

### 6. Run the Bot

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

## Docker Deployment

```bash
cp .env.example .env
# Edit .env with your settings

docker compose up -d        # Start
docker compose logs -f      # View logs
docker compose down          # Stop
```

## Railway Deployment

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add environment variables (`BOT_TOKEN`, `MAIN_GROUP_ID`, `INTRO_TOPIC_ID`)
4. Add a **Volume** with mount path `/app/data` for persistent database storage
5. Deploy — auto-deploys on every push to `main`

## Configuration Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BOT_TOKEN` | Yes | — | Telegram bot token from BotFather |
| `MAIN_GROUP_ID` | Yes | — | ID of your Superteam supergroup |
| `INTRO_TOPIC_ID` | Yes | — | Topic ID for Introductions |
| `INTRO_FORMAT` | No | See below | JSON array of intro format fields |
| `DELETE_UNAUTHORIZED_MESSAGES` | No | `true` | Delete messages from non-introduced users |
| `REMINDER_INTERVAL_HOURS` | No | `24` | Hours between reminder messages |
| `MIN_INTRO_LENGTH` | No | `50` | Minimum characters for valid intro |
| `ENABLE_FORMAT_VALIDATION` | No | `true` | Require self-introduction keywords |
| `ADMIN_USER_IDS` | No | — | Comma-separated admin user IDs |
| `DATABASE_PATH` | No | `./data/bot.db` | SQLite database location |
| `LOG_LEVEL` | No | `info` | Logging level (debug/info/warn/error) |

### Configurable Intro Format

Default format fields (used when `INTRO_FORMAT` is not set):

```json
["Who are you & what do you do?", "Where are you based?", "One fun fact about you", "How are you looking to contribute to Superteam MY?"]
```

To customize, set `INTRO_FORMAT` in your `.env`:

```env
INTRO_FORMAT=["Your name and role","Your location","A fun fact","How you want to contribute"]
```

## User Commands

| Command | Description |
|---------|-------------|
| `/start` | Get welcome message and intro format |
| `/help` | Show help and available commands |
| `/example` | See an example introduction |
| `/status` | Check your introduction status |
| `/id` | Show group ID, topic ID, and your user ID |

## How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Joins    │────▶│  Bot Records    │────▶│  Welcome Msg    │
│   The Group     │     │  New Member     │     │  Sent & Pinned  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Full Access   │◀────│  Bot Validates  │◀────│  User Posts     │
│   Granted 🎉    │     │  & Approves     │     │  Intro in Topic │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. **User joins** the Superteam group
2. **Bot sends** a personalized welcome message tagging the user, pinned in the intro topic
3. **User posts introduction** in the Introductions topic
4. **Bot validates** the intro (length + optional keyword check)
5. **User is approved** and can participate freely across all topics

## Edge Cases Handled

| Edge Case | How It's Handled |
|-----------|-----------------|
| **Leave & rejoin** | User retains intro status from database |
| **Deleted intro** | User stays approved; admin can reset via `/admin_reset` |
| **Bot restart** | All data persists in SQLite database |
| **Admin bypass** | Group admins/creators are never restricted |
| **Media-only intro** | Bot asks for a text introduction |
| **Bot commands in intro topic** | Commands like `/example` don't count as intro attempts |
| **Edited messages** | If a user edits their message to meet requirements, it's accepted |
| **Users joined before bot** | not restricted |

## Project Structure

```
superteam-onboarding-bot/
├── src/
│   ├── index.js              # Entry point — initializes bot and handlers
│   ├── config.js             # Configuration from environment variables
│   ├── database.js           # SQLite operations (users, intro status)
│   ├── messages.js           # All bot message templates
│   ├── validation.js         # Intro validation (length + keyword heuristic)
│   ├── logger.js             # Structured logging utility
│   └── handlers/
│       ├── index.js          # Handler registration
│       ├── newMember.js      # New member detection + welcome message
│       ├── introDetection.js # Intro topic monitoring + validation
│       ├── accessControl.js  # Message restriction enforcement
│       └── commands.js       # User + admin commands
├── scripts/
│   ├── get-ids.js            # Get group ID, topic ID, and admin user ID
│   └── reset-db.js           # Database reset script
├── SETUP_DEPLOYMENT.md       # Setup + deployment instructions
├── .env.example              # Environment variable template
├── Dockerfile                # Docker container configuration
├── docker-compose.yml        # Docker Compose for local deployment
├── package.json
└── README.md
```

## Troubleshooting

### Bot isn't detecting new members
- Ensure the bot is an **admin** in the group
- Verify the group is a **Supergroup** (not a regular group)
- Check that the `MAIN_GROUP_ID` is correct (starts with `-100`)

### Welcome messages not appearing
- Check bot logs for errors
- Verify `INTRO_TOPIC_ID` is correct (send `/id` in the intro topic or run `node scripts/get-ids.js`)
- Ensure the bot has permission to send messages in the intro topic

### Auto-pin not working
- Grant the bot **"Pin Messages"** permission in group admin settings

### Users can't send messages after intro
- Verify the bot has **"Restrict members"** permission
- Check the intro was at least 50 characters and contained intro keywords (if validation enabled)
- Try `/admin_approve <user_id>` to manually approve

## License

MIT
