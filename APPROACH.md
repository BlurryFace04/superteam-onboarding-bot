# Approach & Decisions

## Overview

The bot is built with **Node.js + Telegraf** and uses a **supergroup with a dedicated Introductions topic** as its operating model. New members must post a valid introduction before they can participate in the rest of the group.

---

## Key Decisions

### 1. Topics Mode (not channel-based)
Rather than using a separate intro channel, the bot operates within a single supergroup using Telegram's **Topics** feature. This keeps everything in one place, is easier to set up, and feels more natural for members.

### 2. Delete + Remind (not hard restrict)
Instead of locking users out at the Telegram permissions level, the bot **auto-deletes messages** from non-introduced users and sends them a reminder. This is less disruptive — users can still read the group and post in the intro topic freely.

### 3. Persistent SQLite Storage
User intro status is stored in a **SQLite database** using `better-sqlite3`. It's lightweight, zero-config, and persists across bot restarts and redeployments (via a Railway volume at `/app/data`).

### 4. Grandfathering Existing Members
Users who joined before the bot was added are **not in the database** and are therefore never restricted. Only users the bot explicitly sees joining are required to introduce themselves.

### 5. Heuristic Intro Validation
Beyond a minimum character count (50), the bot optionally checks for **self-introduction keywords** (`"I'm"`, `"my name is"`, `"hey everyone"`, etc.) to ensure messages are genuine introductions and not random text. This is configurable via `ENABLE_FORMAT_VALIDATION`.

### 6. Configurable Intro Format
The intro format fields shown in the welcome message are driven by the `INTRO_FORMAT` env var (a JSON array), making the bot reusable for other communities without code changes.

### 7. Two Join Event Handlers
Telegram fires both `chat_member` and `new_chat_members` events for joins depending on group settings. The bot handles **both** to ensure no new member is missed, with database upserts to prevent duplicate processing.

### 8. Edited Message Support
If a user edits a short/invalid intro to meet the requirements, the bot **detects the edit** and approves them — avoiding the frustration of having to delete and repost.

### 9. Graceful Fallbacks
- Markdown formatting failures fall back to plain text
- DM reminders fall back to an in-group message in the intro topic (auto-deleted after 30s)
- Welcome messages are pinned in the intro topic for visibility

### 10. Admin Tooling
Admins can manage users directly via bot commands using `@username` — no need to know numeric user IDs. Commands include reset, approve, status check, stats, and a full DB reset for testing.
