import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { connectDB } from './database/connection';
import { User } from './models/User';

function normalizeGender(value?: string): 'M' | 'F' {
  const normalized = (value || '').trim().toUpperCase();
  return normalized === 'F' ? 'F' : 'M';
}

function loadStudents(): [string, string, 'M' | 'F'][] {
  const filePath = path.join(__dirname, '../students.txt');
  if (!fs.existsSync(filePath)) {
    console.error('students.txt not found at:', filePath);
    process.exit(1);
  }
  const lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/).filter(l => l.trim());
  return lines.map(line => {
    // Supported formats:
    // 1) ROLL<TAB>NAME
    // 2) ROLL<TAB>NAME<TAB>GENDER
    // 3) SL.NO<TAB>ROLL<TAB>NAME
    // 4) SL.NO<TAB>ROLL<TAB>NAME<TAB>GENDER
    const parts = line.split('\t').map(p => p.trim());
    if (parts.length >= 4) {
      return [parts[1], parts[2], normalizeGender(parts[3])] as [string, string, 'M' | 'F'];
    }
    if (parts.length >= 3) {
      const maybeGender = normalizeGender(parts[2]);
      if (parts[2].toUpperCase() === 'M' || parts[2].toUpperCase() === 'F') {
        return [parts[0], parts[1], maybeGender] as [string, string, 'M' | 'F'];
      }
      return [parts[1], parts[2], 'M'] as [string, string, 'M' | 'F'];
    }
    return [parts[0], parts[1], 'M'] as [string, string, 'M' | 'F'];
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
      batch.map(async ([roll, name, gender]) => {
        const rollNumber = roll.toUpperCase().trim();
        const passwordHash = await bcrypt.hash(rollNumber, 10);
        return {
          rollNumber,
          name: name.trim(),
          gender,
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