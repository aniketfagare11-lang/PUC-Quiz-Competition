
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Question = require('./models/Question');
const Admin = require('./models/Admin');
const Team = require('./models/Team');
const bcrypt = require('bcryptjs');

const testQuestions = {
  A: [
    { questionText: 'Which is the largest planet in our solar system?', options: [{ key: 'A', text: 'Earth' }, { key: 'B', text: 'Jupiter' }, { key: 'C', text: 'Mars' }, { key: 'D', text: 'Venus' }], correctAnswer: 'B' },
    { questionText: 'What is the capital of Japan?', options: [{ key: 'A', text: 'Seoul' }, { key: 'B', text: 'Beijing' }, { key: 'C', text: 'Tokyo' }, { key: 'D', text: 'Bangkok' }], correctAnswer: 'C' },
    { questionText: 'How many sides does a hexagon have?', options: [{ key: 'A', text: '5' }, { key: 'B', text: '6' }, { key: 'C', text: '7' }, { key: 'D', text: '8' }], correctAnswer: 'B' }
  ],
  B: [
    { questionText: 'Find the next number: 2, 4, 8, 16, __', options: [{ key: 'A', text: '24' }, { key: 'B', text: '30' }, { key: 'C', text: '32' }, { key: 'D', text: '36' }], correctAnswer: 'C' },
    { questionText: 'If CAT is coded as DBU, how is DOG coded?', options: [{ key: 'A', text: 'EPH' }, { key: 'B', text: 'EOG' }, { key: 'C', text: 'DPH' }, { key: 'D', text: 'FPH' }], correctAnswer: 'A' },
    { questionText: 'Which number is different: 3, 5, 7, 10, 11?', options: [{ key: 'A', text: '3' }, { key: 'B', text: '7' }, { key: 'C', text: '10' }, { key: 'D', text: '11' }], correctAnswer: 'C' }
  ],
  C: [
    { questionText: 'What does CPU stand for?', options: [{ key: 'A', text: 'Central Processing Unit' }, { key: 'B', text: 'Computer Personal Unit' }, { key: 'C', text: 'Central Program Utility' }, { key: 'D', text: 'Control Processing User' }], correctAnswer: 'A' },
    { questionText: 'Which language is commonly used to style web pages?', options: [{ key: 'A', text: 'SQL' }, { key: 'B', text: 'CSS' }, { key: 'C', text: 'C' }, { key: 'D', text: 'Python' }], correctAnswer: 'B' },
    { questionText: 'What does URL stand for?', options: [{ key: 'A', text: 'Universal Reference Link' }, { key: 'B', text: 'Uniform Resource Locator' }, { key: 'C', text: 'Unified Route Link' }, { key: 'D', text: 'User Resource Location' }], correctAnswer: 'B' }
  ],
  D: [
    { questionText: 'Which organization publishes the World Economic Outlook?', options: [{ key: 'A', text: 'WHO' }, { key: 'B', text: 'IMF' }, { key: 'C', text: 'UNICEF' }, { key: 'D', text: 'WTO' }], correctAnswer: 'B' },
    { questionText: 'What does UPI stand for?', options: [{ key: 'A', text: 'Unified Payments Interface' }, { key: 'B', text: 'Universal Payment Internet' }, { key: 'C', text: 'United Payments Integration' }, { key: 'D', text: 'Unified Purchase Interface' }], correctAnswer: 'A' },
    { questionText: 'What does ISRO stand for?', options: [{ key: 'A', text: 'Indian Science Research Office' }, { key: 'B', text: 'International Space Research Organization' }, { key: 'C', text: 'Indian Space Research Organisation' }, { key: 'D', text: 'Indian Satellite Research Office' }], correctAnswer: 'C' }
  ]
};

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    // Add test questions only to empty sets.
    for (const [set, questions] of Object.entries(testQuestions)) {
      const count = await Question.countDocuments({ round: 1, set });

      if (count === 0) {
        const docs = questions.map((q, index) => ({
          ...q,
          round: 1,
          set,
          order: index + 1,
          type: 'mcq',
          marks: 1
        }));

        await Question.insertMany(docs);
        console.log(`Added ${docs.length} test questions to Set ${set}`);
      } else {
        console.log(`Set ${set} already has ${count} questions; skipped`);
      }
    }

    // Create missing team records only; never reset existing teams.
    const totalTeams = Number(process.env.TOTAL_TEAMS) || 20;

    for (let i = 1; i <= totalTeams; i++) {
      await Team.updateOne(
        { teamNumber: i },
        { $setOnInsert: { teamNumber: i } },
        { upsert: true }
      );
    }

    // Create admin only if the username doesn't already exist.
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await Admin.findOne({ username });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(password, 10);
      await Admin.create({ username, passwordHash });
      console.log(`Created admin: ${username}`);
    } else {
      console.log(`Admin ${username} already exists; preserved`);
    }

    console.log('Seeding complete. Existing attempts and results were not modified.');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
