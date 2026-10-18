
const router = require('express').Router();
const adminController = require('../controllers/adminController');
const adminAuthController = require('../controllers/authController');
const { verifyAdmin } = require('../middleware/auth');

// Public admin login — must be BEFORE verifyAdmin
router.post('/login', adminAuthController.adminLogin);

// All routes below require an admin token
router.use(verifyAdmin);

// Dashboard
router.get('/overview', adminController.overview);
router.get('/teams', adminController.teams);
router.get('/rankings', adminController.rankings);
router.get('/results/combined', adminController.combinedResults);

// Attempt management
router.post(
  '/attempts/:id/force-submit',
  adminController.forceSubmit
);

// Team management
router.delete(
  '/teams/:teamNumber/reset',
  adminController.resetAttempt
);

// Question management
router.get('/questions', adminController.questions);
router.post('/questions', adminController.createQuestion);
router.put('/questions/:id', adminController.updateQuestion);
router.delete('/questions/:id', adminController.deleteQuestion);

// Active question set
router.get('/active-set', adminController.getActiveSet);
router.put('/active-set', adminController.setActiveSet);

module.exports = router;
