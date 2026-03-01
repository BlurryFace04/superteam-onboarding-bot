# Superteam Intro Gatekeeper Bot

A Telegram bot that ensures new members introduce themselves before participating in the Superteam MY group.

## Features

### Core Functionality
- **New Member Detection**: Automatically detects when users join the group
- **Welcome Messages**: Sends personalized welcome message with intro format guidelines
- **Intro Verification**: Monitors the group for member introductions
- **Access Control**: Restricts messaging until intro is completed
- **Auto-unrestrict**: Grants full permissions once a valid intro is posted

### Setup Modes
- **Single Group Mode** (Default): Users post intros in the same group - simpler setup!
- **Two Group Mode** (Optional): Separate intro channel for introductions

### Admin Features
- Reset user intro status
- Manually approve users
- View user status details
- Bot statistics dashboard
- List pending introductions

### Additional Features
- SQLite persistent storage
- Configurable intro validation
- Rate-limited reminders
- Docker deployment support
- Comprehensive logging

## Quick Start

### Prerequisites
- Node.js 18+
- A Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Admin access to your Telegram group

### 1. Create Your Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow the prompts
3. Copy the bot token

### 2. Get Group/Channel IDs

1. Add [@RawDataBot](https://t.me/rawdatabot) to your Telegram group
2. Send any message in the group
3. The bot will reply with "Your chat ID is -XXXXXXXXX"
4. Copy that chat ID

**For single group setup (recommended):**
- You only need the MAIN_GROUP_ID
- Leave INTRO_CHANNEL_ID blank

**For two-group setup:**
- Get the ID for both your main group and intro channel
- Set both MAIN_GROUP_ID and INTRO_CHANNEL_ID

### 3. Configure Bot Permissions

**Important**: The bot needs admin rights in your group:

In your **Main Group**:
- Add the bot as admin
- Enable "Delete messages"
- Enable "Restrict members"

(If using two-group mode, give the bot read access in the intro channel as well)

### 4. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd superteam-intro-gatekeeper-bot

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 5. Configuration

Edit `.env` with your settings:

```env
# Required
BOT_TOKEN=your_bot_token_here
MAIN_GROUP_ID=-100xxxxxxxxxx
INTRO_CHANNEL_ID=-100xxxxxxxxxx

# Optional
DELETE_UNAUTHORIZED_MESSAGES=true
MIN_INTRO_LENGTH=50
ADMIN_USER_IDS=123456789,987654321
```

### 6. Run the Bot

```bash
# Development
npm run dev

# Production
npm start
```

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Create .env file first
cp .env.example .env
# Edit .env with your settings

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Using Docker directly

```bash
# Build
docker build -t superteam-intro-bot .

# Run
docker run -d \
  --name superteam-intro-bot \
  --env-file .env \
  -v bot-data:/app/data \
  superteam-intro-bot
```

## Configuration Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BOT_TOKEN` | Yes | - | Telegram bot token from BotFather |
| `MAIN_GROUP_ID` | Yes | - | ID of your Superteam group |
| `INTRO_CHANNEL_ID` | No | (same as main) | Separate intro channel ID (leave blank for single-group mode) |
| `DELETE_UNAUTHORIZED_MESSAGES` | No | `true` | Delete messages from non-introduced users |
| `REMINDER_INTERVAL_HOURS` | No | `24` | Hours between reminder messages |
| `MIN_INTRO_LENGTH` | No | `50` | Minimum characters for valid intro |
| `ENABLE_FORMAT_VALIDATION` | No | `false` | Use heuristic format checking |
| `ADMIN_USER_IDS` | No | - | Comma-separated admin user IDs |
| `DATABASE_PATH` | No | `./data/bot.db` | SQLite database location |
| `LOG_LEVEL` | No | `info` | Logging level (debug/info/warn/error) |

## Commands

### User Commands
| Command | Description |
|---------|-------------|
| `/start` | Get welcome message and intro format |
| `/help` | Show help and available commands |
| `/example` | See an example introduction |
| `/status` | Check your introduction status |

### Admin Commands
| Command | Description |
|---------|-------------|
| `/admin_help` | Show admin commands |
| `/admin_reset <user_id>` | Reset user's intro status |
| `/admin_approve <user_id>` | Manually approve a user |
| `/admin_status <user_id>` | View user's detailed status |
| `/admin_stats` | View bot statistics |
| `/admin_list_pending` | List users awaiting intro |

## How It Works

### Single Group Mode (Default)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Joins    │────▶│  Bot Restricts  │────▶│  Welcome DM     │
│   The Group     │     │  User Perms     │     │  Sent           │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Full Access   │◀────│  Unrestrict     │◀────│  User Posts     │
│   Granted       │     │  User           │     │  Intro in Group │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. **User joins** the Superteam group
2. **Bot restricts** the user from sending messages
3. **Welcome message** is sent via DM (or in-group if DM fails)
4. **User posts introduction** in the same group (at least 50 characters)
5. **Bot validates** the intro meets minimum requirements
6. **User is unrestricted** and can participate fully
7. **Intro stays visible** for everyone to see and reference

## Intro Format

The bot guides users to introduce themselves with:

- Who you are & what you do
- Where you're based
- One fun fact about you
- How you're looking to contribute to Superteam MY

## Edge Cases Handled

- **Rejoining members**: Previously introduced users retain their status
- **DM blocked**: Falls back to in-group messages (auto-deleted after 60s for welcome, permanent for approval)
- **Admin bypass**: Group admins are never restricted
- **Bot restart**: All data persists in SQLite database
- **Deleted intros**: User remains approved once marked complete
- **Short messages**: Only messages with 50+ characters trigger intro validation
- **Single group mode**: Intro messages allowed through, then validated

## Project Structure

```
superteam-intro-gatekeeper-bot/
├── src/
│   ├── index.js           # Main entry point
│   ├── config.js          # Configuration management
│   ├── database.js        # SQLite operations
│   ├── messages.js        # Bot message templates
│   ├── validation.js      # Intro validation logic
│   ├── logger.js          # Logging utility
│   └── handlers/
│       ├── index.js       # Handler exports
│       ├── newMember.js   # New member detection
│       ├── introDetection.js  # Intro channel monitoring
│       ├── accessControl.js   # Message restriction
│       └── commands.js    # Bot commands
├── data/                  # SQLite database (gitignored)
├── .env.example           # Environment template
├── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Troubleshooting

### Bot isn't detecting new members
- Ensure the bot is an admin in the group
- Check that `chat_member` updates are enabled (the bot does this automatically)
- Verify the group ID is correct and negative

### Welcome messages not sending
- Users may have privacy settings blocking bot DMs
- The bot will fallback to in-group messages
- Check bot logs for errors

### Users still can't send messages after intro
- Verify the bot has "Restrict members" permission
- Check the intro was at least 50 characters long
- Look at bot logs for validation errors
- Try `/admin_approve <user_id>` to manually approve

### Getting group/channel IDs
- Use [@RawDataBot](https://t.me/rawdatabot) - add to group and send any message
- Alternative: [@userinfobot](https://t.me/userinfobot) or [@getidsbot](https://t.me/getidsbot)
- The ID will be negative and start with `-` (e.g., `-5178164012`)

### Single vs Two-Group Setup
- **Single group**: Leave `INTRO_CHANNEL_ID` blank - users post intros in main group
- **Two groups**: Set both IDs - users post intros in separate channel

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.
