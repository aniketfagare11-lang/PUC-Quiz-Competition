
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Question = require('./models/Question');
const Admin = require('./models/Admin');
const QuizConfig = require('./models/QuizConfig');
const { round1Questions } = require('./utils/seedData');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    for (const set of ['A', 'B', 'C', 'D']) {
      const questions = round1Questions[set];
      const orders = questions.map((question) => question.order);
      await Question.deleteMany({
        round: 1,
        set,
        order: { $nin: orders },
      });
      await Question.bulkWrite(
        questions.map((question) => ({
          updateOne: {
            filter: { round: 1, set, order: question.order },
            update: { $set: question },
            upsert: true,
          },
        }))
      );
      console.log(`Seeded ${questions.length} source questions in Set ${set}`);
    }

    await QuizConfig.findOneAndUpdate(
      { key: 'quiz' },
      { $setOnInsert: { activeSet: 'A' } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const username = (process.env.ADMIN_USERNAME || '').trim();
    const password = process.env.ADMIN_PASSWORD || '';
    if (!username || !password) {
      throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be set before seeding');
    }

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
