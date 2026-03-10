import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { connectDB } from './database/connection';
import { User } from './models/User';

function loadStudents(): [string, string][] {
  const filePath = path.join(__dirname, '../students.txt');
  if (!fs.existsSync(filePath)) {
    console.error('students.txt not found at:', filePath);
    process.exit(1);
  }
  const lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/).filter(l => l.trim());
  return lines.map(line => {
    // Support formats: ROLL<tab>NAME or SL.NO<tab>ROLL<tab>NAME
    const parts = line.split('\t').map(p => p.trim());
    if (parts.length >= 3) {
      return [parts[1], parts[2]] as [string, string];
    }
    return [parts[0], parts[1]] as [string, string];
  });
}

async function seed() {
  await connectDB();

  const STUDENT_LIST = loadStudents();
  console.log(`Loaded ${STUDENT_LIST.length} students from students.txt`);

  const existing = await User.countDocuments();
  if (existing > 0) {
    console.log(`Database already has ${existing} users. Skipping seed.`);
    console.log('Use --force flag to re-seed: npm run seed -- --force');
    if (!process.argv.includes('--force')) {
      process.exit(0);
    }
    console.log('Force flag detected - dropping existing users...');
    await User.deleteMany({});
  }

  console.log(`Seeding ${STUDENT_LIST.length} students...`);

  const BATCH_SIZE = 50;
  let created = 0;

  for (let i = 0; i < STUDENT_LIST.length; i += BATCH_SIZE) {
    const batch = STUDENT_LIST.slice(i, i + BATCH_SIZE);
    const docs = await Promise.all(
      batch.map(async ([roll, name]) => {
        const rollNumber = roll.toUpperCase().trim();
        const passwordHash = await bcrypt.hash(rollNumber, 10);
        return {
          rollNumber,
          name: name.trim(),
          passwordHash,
          bestScore: 0,
        };
      }),
    );
    try {
      await User.insertMany(docs, { ordered: false });
    } catch (e: any) {
      if (e.code !== 11000) throw e;
      console.log(`  (skipped some duplicates in batch)`);
    }
    created += docs.length;
    console.log(`  ${created} / ${STUDENT_LIST.length}`);
  }

  console.log(`Done! ${created} students seeded.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});