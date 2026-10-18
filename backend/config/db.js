const mongoose = require('mongoose');

/**
 * Connect Mongoose to MongoDB (Atlas in production, local/in-memory for dev).
 * @param {string} uri MongoDB connection string
 */
async function connectDB(uri) {
  if (!uri) throw new Error('MONGO_URI is not set');
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri);
  console.log(`✓ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}

module.exports = connectDB;
