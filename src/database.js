import Database from 'better-sqlite3';
import { config } from './config.js';
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

let db = null;

export function initDatabase() {
  const dbDir = dirname(config.database.path);
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(config.database.path);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY,
      username TEXT,
      first_name TEXT,
      last_name TEXT,
      intro_status TEXT DEFAULT 'pending',
      intro_message_id INTEGER,
      intro_completed_at TEXT,
      joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_reminded_at TEXT,
      manually_approved INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_status ON users(intro_status);
    CREATE INDEX IF NOT EXISTS idx_users_joined ON users(joined_at);
  `);

  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function getUser(userId) {
  const stmt = db.prepare('SELECT * FROM users WHERE user_id = ?');
  return stmt.get(userId);
}

export function getUserByUsername(username) {
  const cleanUsername = username.replace(/^@/, '').toLowerCase();
  const stmt = db.prepare('SELECT * FROM users WHERE LOWER(username) = ?');
  return stmt.get(cleanUsername);
}

export function upsertUser(userData) {
  const stmt = db.prepare(`
    INSERT INTO users (user_id, username, first_name, last_name, joined_at, updated_at)
    VALUES (@userId, @username, @firstName, @lastName, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      username = @username,
      first_name = @firstName,
      last_name = @lastName,
      updated_at = CURRENT_TIMESTAMP
  `);
  
  return stmt.run({
    userId: userData.userId,
    username: userData.username || null,
    firstName: userData.firstName || null,
    lastName: userData.lastName || null,
  });
}

export function markUserIntroduced(userId, messageId = null) {
  const stmt = db.prepare(`
    UPDATE users 
    SET intro_status = 'completed',
        intro_message_id = ?,
        intro_completed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `);
  return stmt.run(messageId, userId);
}

export function resetUserIntro(userId) {
  const stmt = db.prepare(`
    UPDATE users 
    SET intro_status = 'pending',
        intro_message_id = NULL,
        intro_completed_at = NULL,
        manually_approved = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `);
  return stmt.run(userId);
}

export function manuallyApproveUser(userId) {
  const stmt = db.prepare(`
    UPDATE users 
    SET intro_status = 'completed',
        manually_approved = 1,
        intro_completed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `);
  return stmt.run(userId);
}

export function isUserIntroduced(userId) {
  const user = getUser(userId);
  return user?.intro_status === 'completed';
}

export function updateLastReminded(userId) {
  const stmt = db.prepare(`
    UPDATE users 
    SET last_reminded_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `);
  return stmt.run(userId);
}

export function getUsersNeedingReminder(hoursAgo) {
  const stmt = db.prepare(`
    SELECT * FROM users 
    WHERE intro_status = 'pending'
    AND (last_reminded_at IS NULL 
         OR datetime(last_reminded_at, '+' || ? || ' hours') < CURRENT_TIMESTAMP)
  `);
  return stmt.all(hoursAgo);
}

export function getPendingUsers() {
  const stmt = db.prepare(`
    SELECT * FROM users 
    WHERE intro_status = 'pending'
    ORDER BY joined_at DESC
  `);
  return stmt.all();
}

export function getStats() {
  const totalStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const completedStmt = db.prepare("SELECT COUNT(*) as count FROM users WHERE intro_status = 'completed'");
  const pendingStmt = db.prepare("SELECT COUNT(*) as count FROM users WHERE intro_status = 'pending'");
  const manualStmt = db.prepare("SELECT COUNT(*) as count FROM users WHERE manually_approved = 1");

  return {
    total: totalStmt.get().count,
    completed: completedStmt.get().count,
    pending: pendingStmt.get().count,
    manuallyApproved: manualStmt.get().count,
  };
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

export function resetDatabase() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  // Delete all users
  const deleteStmt = db.prepare('DELETE FROM users');
  const result = deleteStmt.run();
  
  return result.changes;
}
