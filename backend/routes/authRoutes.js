const router = require('express').Router();
const authController = require('../controllers/authController');

// POST /api/auth/admin/login
router.post('/admin/login', authController.adminLogin);

module.exports = router;
