import { existsSync, unlinkSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || './data/bot.db';

console.log('🗑️  Database Reset Script');
console.log('='.repeat(50));

const filesToDelete = [
  dbPath,
  `${dbPath}-wal`,
  `${dbPath}-shm`,
];

let deleted = 0;

for (const file of filesToDelete) {
  if (existsSync(file)) {
    try {
      unlinkSync(file);
      console.log(`✅ Deleted: ${file}`);
      deleted++;
    } catch (error) {
      console.error(`❌ Failed to delete ${file}:`, error.message);
    }
  } else {
    console.log(`⏭️  Not found (skipping): ${file}`);
  }
}

console.log('='.repeat(50));

if (deleted > 0) {
  console.log(`✅ Database reset complete! Deleted ${deleted} file(s).`);
  console.log('   The database will be recreated when you start the bot.');
} else {
  console.log('ℹ️  No database files found. Nothing to reset.');
}
