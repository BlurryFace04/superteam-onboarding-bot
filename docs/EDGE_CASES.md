# Edge Cases

## Handled Edge Cases

### Leave & Rejoin (Already Introduced)
When a user who has already introduced themselves leaves and rejoins the group, the bot remembers their intro status from the SQLite database. They can participate immediately without re-introducing.

### Leave & Rejoin (Never Introduced)
If a user who never completed their intro leaves and rejoins, the bot sends the welcome message again in the intro topic, prompting them to introduce themselves.

### Deleted Intro Message
If a user's intro message gets deleted (by them or an admin), their "introduced" status is preserved. They don't need to re-introduce.

### Bot Restart / Crash
All user data is stored in a SQLite database, so intro statuses persist across bot restarts. No data is lost.

### Admin Bypass
Group administrators and the group creator are never restricted. Their messages are never deleted, and they don't need to introduce themselves.

### Service Messages (Join/Leave Notifications)
Telegram sends service messages like "User joined" or "User left the group". The bot ignores these and doesn't treat them as unauthorized messages from the user.

### Media / Sticker Instead of Text Intro
If a user sends a photo, sticker, GIF, or any media without text in the intro topic, the bot replies asking them to write a text introduction instead.

### Bot Commands in Intro Topic
Commands like `/help`, `/example`, or `/status` sent in the intro topic are ignored and don't count as intro attempts.

### User Edits Message to Meet Requirements
If a user posts a short intro and then edits it to meet the minimum character requirement, the bot detects the edit and approves them.

### Markdown Formatting Failure
If the welcome message fails to send due to Markdown parsing issues, the bot falls back to sending it as plain text.

### DM Not Possible
The bot sends messages directly in the intro topic instead of attempting DMs, since most users won't have started a conversation with the bot.

### Duplicate Join Events
Telegram can fire both `chat_member` and `new_chat_members` events for the same join. The bot handles both gracefully — if the welcome message was already sent by one handler, the database state prevents duplicate processing.

---

## Potential Edge Cases (Not Yet Handled)

### ~~Users Who Joined Before Bot Was Added~~ (Now Handled)
~~If the bot is added to a group that already has members, those existing members are not tracked.~~

**Update:** This is now handled. Users who are not in the bot's database (i.e., they joined before the bot was added) are "grandfathered in" and can participate freely without introducing themselves. Only users who the bot explicitly saw join are required to introduce themselves.

### User Banned and Unbanned
If a user is banned and later unbanned, Telegram may not fire a `new_chat_members` event. The user might be able to rejoin without the bot detecting them.

### Multiple Bots Conflicting
If another bot in the group also manages permissions or deletes messages, there could be conflicts. No coordination mechanism exists between bots.

### Rate Limiting by Telegram API
If many users join simultaneously (e.g., a group link goes viral), the Telegram API rate limits could prevent the bot from sending welcome messages or processing intros in time.

### Unicode / RTL Text in Intros
Introductions written entirely in non-Latin scripts or with RTL text are accepted as long as they meet the character count. The heuristic format validation (if enabled) may not work well with non-English intros.

### Group Migrated to Another Supergroup
If the group is migrated again (e.g., ownership transfer), the group ID changes and the bot would need to be reconfigured with the new ID.

### User Changes Username After Introducing
The database stores the username at the time of introduction. If the user changes their username later, the stored username becomes stale. Admin commands (`/admin_status`) may show outdated info.

### Bot Removed and Re-added
If the bot is removed from the group and added back, it loses track of any events that occurred while it was absent. The database still retains previously introduced users, but any users who joined while the bot was gone are untracked.
