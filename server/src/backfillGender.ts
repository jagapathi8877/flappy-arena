import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { connectDB } from './database/connection';
import { User } from './models/User';

function normalizeGender(value?: string): 'M' | 'F' {
  const normalized = (value || '').trim().toUpperCase();
  return normalized === 'F' ? 'F' : 'M';
}

function loadGenderByRoll(): Map<string, 'M' | 'F'> {
  const filePath = path.join(__dirname, '../students.txt');
  if (!fs.existsSync(filePath)) {
    console.error('students.txt not found at:', filePath);
    process.exit(1);
  }

  const lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/).filter((l) => l.trim());
  const map = new Map<string, 'M' | 'F'>();

  for (const line of lines) {
    const parts = line.split('\t').map((p) => p.trim());

    let roll = '';
    let gender: 'M' | 'F' = 'M';

    if (parts.length >= 4) {
      roll = parts[1].toUpperCase();
      gender = normalizeGender(parts[3]);
    } else if (parts.length >= 3) {
      if (parts[2].toUpperCase() === 'M' || parts[2].toUpperCase() === 'F') {
        roll = parts[0].toUpperCase();
        gender = normalizeGender(parts[2]);
      } else {
        roll = parts[1].toUpperCase();
        gender = 'M';
      }
    } else if (parts.length >= 2) {
      roll = parts[0].toUpperCase();
      gender = 'M';
    }

    if (roll) {
      map.set(roll, gender);
    }
  }

  return map;
}

async function run() {
  await connectDB();

  const byRoll = loadGenderByRoll();
  console.log(`Loaded ${byRoll.size} roll numbers from students.txt`);

  const bulkOps = Array.from(byRoll.entries()).map(([rollNumber, gender]) => ({
    updateOne: {
      filter: { rollNumber },
      update: { $set: { gender } },
    },
  }));

  if (bulkOps.length === 0) {
    console.log('No records to update.');
    process.exit(0);
  }

  const result = await User.bulkWrite(bulkOps, { ordered: false });
  console.log('Backfill complete:', {
    matched: result.matchedCount,
    modified: result.modifiedCount,
  });

  process.exit(0);
}

run().catch((err) => {
  console.error('Gender backfill failed:', err);
  process.exit(1);
});
