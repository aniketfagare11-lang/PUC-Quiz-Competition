const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';
const TOKEN_TTL = '12h';

function signTeam(teamNumber, participants = []) {
  return jwt.sign({ role: 'team', teamNumber, participants }, SECRET, { expiresIn: TOKEN_TTL });
}

function signAdmin(username) {
  return jwt.sign({ role: 'admin', username }, SECRET, { expiresIn: TOKEN_TTL });
}

function extractToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

function verifyAdmin(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admin access only' });
    req.admin = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function verifyTeam(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: 'Team authentication required' });
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== 'team') return res.status(403).json({ message: 'Team token required' });
    req.team = decoded; // { teamNumber }
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { signTeam, signAdmin, verifyAdmin, verifyTeam, SECRET };
