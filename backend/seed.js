const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Question = require('./models/Question');
const Admin = require('./models/Admin');
const Team = require('./models/Team');
const bcrypt = require('bcryptjs');
const { round1Questions, round2Questions } = require('./utils/seedData');

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    // 1) Questions
    // Only seed questions if the round has no questions.
    // Existing event questions are NEVER deleted or replaced.
    const round1Count = await Question.countDocuments({ round: 1 });
    if (round1Count === 0) {
      await Question.insertMany(round1Questions);
      console.log(`✓ Seeded ${round1Questions.length} Round 1 questions`);
    } else {
      console.log(`✓ Round 1 already has ${round1Count} questions — skipped`);
    }

    const round2Count = await Question.countDocuments({ round: 2 });
    if (round2Count === 0) {
      await Question.insertMany(round2Questions);
      console.log(`✓ Seeded ${round2Questions.length} Round 2 questions`);
    } else {
      console.log(`✓ Round 2 already has ${round2Count} questions — skipped`);
    }

    // Predefined teams. Existing records and attempts are never deleted here.
    const totalTeams = Number(process.env.TOTAL_TEAMS) || 20;
    await Promise.all(Array.from({ length: totalTeams }, (_, i) =>
      Team.updateOne({ teamNumber: i + 1 }, { $setOnInsert: { teamNumber: i + 1 } }, { upsert: true })
    ));

    // 2) Admin user (from env, defaults provided for demo)
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    await Admin.deleteMany({});
    const passwordHash = await bcrypt.hash(password, 10);
    await Admin.create({ username, passwordHash });
    console.log(`✓ Seeded admin  ->  ${username} / ${password}`);

    await mongoose.disconnect();
    console.log('✓ Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('✗ Seeding failed:', err);
    process.exit(1);
  }
})();
