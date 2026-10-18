const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const { signAdmin } = require('../middleware/auth');

exports.adminLogin = async (req, res, next) => {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password || '';
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    return res.json({ token: signAdmin(admin.username), username: admin.username });
  } catch (err) {
    return next(err);
  }
};
