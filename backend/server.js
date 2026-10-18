const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// CORS — allow the configured client origin(s); open in dev if not set
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((s) => s.trim())
  : true;
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.use('/uploads', express.static('uploads'));
// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/attempts', require('./routes/attemptRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 + error handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ API server running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('✗ Failed to start:', err.message);
    process.exit(1);
  });
